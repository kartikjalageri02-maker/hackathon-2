import sys
import time
import httpx

BASE_URL = "http://127.0.0.1:8000"


def run_full_e2e_smoke():
    print("=== Running Complete End-to-End Smoke Test for 'Beyond the Factory Floor' ===")

    with httpx.Client(base_url=BASE_URL, timeout=15.0) as client:
        # 1. Health & Factory Layout
        r = client.get("/health")
        assert r.status_code == 200, f"Health check failed: {r.status_code}"
        assert r.json()["status"] == "healthy"
        print("✓ GET /health: OK")

        r = client.get("/api/factory/layout")
        assert r.status_code == 200, f"Factory layout failed: {r.status_code}"
        layout = r.json()
        assert len(layout["machines"]) == 3, f"Expected 3 machines, got {len(layout['machines'])}"
        print(f"✓ GET /api/factory/layout: 3 machines ({[m['id'] for m in layout['machines']]})")

        r = client.get("/api/dependencies/graph")
        assert r.status_code == 200, f"Dependency graph failed: {r.status_code}"
        dep_graph = r.json()
        assert len(dep_graph["edges"]) >= 2, "Expected dependencies between machines"
        print(f"✓ GET /api/dependencies/graph: {len(dep_graph['edges'])} edges in topological line")

        # 2. Sensors latest
        r = client.get("/api/machines/MCH001/sensors/latest")
        assert r.status_code == 200, f"Sensors latest failed: {r.status_code}"
        reading = r.json()
        assert "readings" in reading and "temperature_c" in reading["readings"]
        ch = reading["readings"]
        print(f"✓ GET /api/machines/MCH001/sensors/latest: temp={ch['temperature_c']}°C, vib={ch['vibration_mm_s']} mm/s")

        # 3. Lifecycle
        r = client.get("/api/machines/MCH001/components")
        assert r.status_code == 200, f"Components failed: {r.status_code}"
        components = r.json()
        assert len(components) >= 4
        print(f"✓ GET /api/machines/MCH001/components: {len(components)} components verified with RUL & stress factor")

        # 4. Dependency graph & Production Impact
        r = client.get("/api/dependencies/impact")
        assert r.status_code == 200, f"Dependency impact failed: {r.status_code}"
        impact = r.json()
        assert "baseline_line_uph" in impact and "effective_line_uph" in impact
        print(f"✓ GET /api/dependencies/impact: Baseline {impact['baseline_line_uph']} UPH, Effective {impact['effective_line_uph']} UPH")

        # 5. Resources: Spare Parts & Technicians
        r = client.get("/api/resources/spare-parts")
        assert r.status_code == 200
        parts = r.json()
        assert len(parts) >= 10
        print(f"✓ GET /api/resources/spare-parts: {len(parts)} parts in inventory (including reorder & out-of-stock items)")

        r = client.get("/api/resources/technicians")
        assert r.status_code == 200
        techs = r.json()
        assert len(techs) >= 5
        print(f"✓ GET /api/resources/technicians: {len(techs)} technicians rostered with skill matrix")

        # 6. Trigger Failure Scenario: Motor Overheating on MCH001
        print("\n--- Triggering Simulation Scenario: Motor Overheating ---")
        scenario_req = {
            "machine_id": "MCH001",
            "duration_seconds": 25.0,
            "speed": 3.0
        }
        r = client.post("/api/simulation/scenarios/motor_overheating/start", json=scenario_req)
        assert r.status_code == 200
        print("✓ Started 'motor_overheating' scenario on MCH001 at 3x speed")

        print("Waiting 7 seconds for scenario ramping and analysis pipeline...")
        time.sleep(7.0)

        # 7. Verify Intelligence Scoring Derating & Explanations
        r = client.get("/api/machines/MCH001/analysis")
        assert r.status_code == 200
        analysis = r.json()
        print(f"✓ Analysis post-injection: Health={analysis['health_score']}%, Risk={analysis['risk_score']}, Severity={analysis['severity']}")
        print(f"✓ Penalties: {[r['factor'] + ': ' + str(r['points']) for r in analysis['reasons']]}")
        assert len(analysis["reasons"]) > 0

        # 8. Verify Alert Creation & Lifecycle
        r = client.get("/api/alerts?status=ACTIVE")
        assert r.status_code == 200
        active_alerts = r.json()
        print(f"✓ Active alerts count: {len(active_alerts)}")

        if len(active_alerts) > 0:
            target_alert = active_alerts[0]
            alert_id = target_alert["id"]
            print(f"Testing alert workflow on Alert {alert_id} ({target_alert['title']}):")

            # Acknowledge with Operator role
            ack_resp = client.post(
                f"/api/alerts/{alert_id}/acknowledge",
                headers={"X-Demo-Role": "Operator"}
            )
            assert ack_resp.status_code == 200, f"Acknowledge failed: {ack_resp.status_code}"
            print("  ✓ POST /api/alerts/.../acknowledge with 'Operator': OK")

            # Resolve with Supervisor role
            res_resp = client.post(
                f"/api/alerts/{alert_id}/resolve",
                headers={"X-Demo-Role": "Supervisor"}
            )
            assert res_resp.status_code == 200, f"Resolve failed: {res_resp.status_code}"
            print("  ✓ POST /api/alerts/.../resolve with 'Supervisor': OK")

        # 9. Verify Recommendations Engine
        r = client.get("/api/recommendations?machine_id=MCH001")
        assert r.status_code == 200
        recs = r.json()
        print(f"✓ GET /api/recommendations?machine_id=MCH001: returned {len(recs)} prescriptive recommendations")
        if len(recs) > 0:
            top_rec = recs[0]
            print(f"  ✓ Top recommendation: {top_rec['problem_statement']} (Priority: {top_rec['priority']})")
            print(f"  ✓ Justification: {[w['factor'] for w in top_rec['why']]}")

            # Test approving recommendation with Supervisor role
            app_resp = client.post(
                f"/api/recommendations/{top_rec['id']}/approve",
                headers={"X-Demo-Role": "Supervisor"}
            )
            assert app_resp.status_code == 200
            print("  ✓ POST /api/recommendations/.../approve with 'Supervisor': Work order scheduled")

        # 10. Reset Simulation
        r = client.post("/api/simulation/reset")
        assert r.status_code == 200
        print("✓ POST /api/simulation/reset: Factory returned to normal state")

    print("\n🎉 Complete End-to-End System Smoke Test PASSED 100% cleanly!\n")


if __name__ == "__main__":
    try:
        run_full_e2e_smoke()
    except Exception as e:
        print(f"\n❌ Full E2E Smoke Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
