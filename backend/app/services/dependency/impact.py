from typing import Dict, Any, List, Optional
import networkx as nx
from sqlalchemy.orm import Session
from app.models.machine import Machine, MachineDependency
from app.models.analysis import AnalysisSnapshot


class DependencyService:
    UNIT_MARGIN_USD = 45.0  # Estimated margin per manufactured unit

    def calculate_impact(self, db: Session) -> Dict[str, Any]:
        machines = {m.id: m for m in db.query(Machine).all()}
        dependencies = db.query(MachineDependency).all()

        G = nx.DiGraph()
        for m_id, m in machines.items():
            G.add_node(m_id, machine=m)

        for dep in dependencies:
            G.add_edge(dep.upstream_id, dep.downstream_id, factor=dep.propagation_factor, description=dep.description)

        # Get latest analysis snapshot for each machine
        node_status = {}
        for m_id, m in machines.items():
            snap = db.query(AnalysisSnapshot).filter(
                AnalysisSnapshot.machine_id == m_id
            ).order_by(AnalysisSnapshot.id.desc()).first()

            health = snap.health_score if snap else 100.0
            risk = snap.risk_score if snap else 0.0
            severity = snap.severity if snap else "Normal"

            # Derating formula
            if health >= 90.0:
                derate = 1.0
            elif health >= 50.0:
                derate = 0.5 + ((health - 50.0) / 40.0) * 0.5
            else:
                derate = max(0.1, health / 100.0)

            own_capacity = round(m.nominal_throughput_uph * derate, 1)

            node_status[m_id] = {
                "id": m_id,
                "name": m.name,
                "role_in_line": m.role_in_line,
                "nominal_uph": m.nominal_throughput_uph,
                "health_score": health,
                "risk_score": risk,
                "severity": severity,
                "derate_factor": round(derate, 2),
                "own_capacity_uph": own_capacity,
                "effective_uph": own_capacity,
                "starved_by": None
            }

        # Topologically evaluate effective throughput
        try:
            topo_order = list(nx.topological_sort(G))
        except nx.NetworkXUnfeasible:
            topo_order = list(machines.keys())

        for m_id in topo_order:
            preds = list(G.predecessors(m_id))
            if preds:
                # Sum of upstream effective output * propagation factor
                upstream_flow = sum(
                    node_status[p]["effective_uph"] * G[p][m_id].get("factor", 1.0)
                    for p in preds
                )
                own_cap = node_status[m_id]["own_capacity_uph"]
                if upstream_flow < own_cap:
                    node_status[m_id]["effective_uph"] = round(upstream_flow, 1)
                    node_status[m_id]["starved_by"] = preds[0]
                else:
                    node_status[m_id]["effective_uph"] = own_cap

        # Baseline exit output (downstream machine, MCH003)
        exit_machine_id = "MCH003" if "MCH003" in node_status else list(node_status.keys())[-1]
        baseline_line_uph = machines[exit_machine_id].nominal_throughput_uph
        effective_line_uph = node_status[exit_machine_id]["effective_uph"]
        lost_uph = max(0.0, round(baseline_line_uph - effective_line_uph, 1))
        loss_pct = round((lost_uph / baseline_line_uph) * 100.0, 1) if baseline_line_uph > 0 else 0.0
        hourly_loss_usd = round(lost_uph * self.UNIT_MARGIN_USD, 2)

        # Root cause determination
        # Anomalous machines (health < 90 or severity != Normal)
        anomalous = [
            m_id for m_id in topo_order
            if node_status[m_id]["health_score"] < 90.0 or node_status[m_id]["severity"] != "Normal"
        ]

        root_cause_id = None
        if anomalous:
            # Pick first anomalous machine with no anomalous predecessor
            for a_id in anomalous:
                preds = list(G.predecessors(a_id))
                if not any(p in anomalous for p in preds):
                    root_cause_id = a_id
                    break
            if not root_cause_id:
                # Break ties by highest risk score
                root_cause_id = max(anomalous, key=lambda x: node_status[x]["risk_score"])
        else:
            # If all nominal, find lowest capacity machine
            root_cause_id = min(node_status.keys(), key=lambda x: node_status[x]["effective_uph"])

        # Build propagation narrative
        propagation_chain = []
        for m_id in topo_order:
            st = node_status[m_id]
            if st["starved_by"]:
                propagation_chain.append(
                    f"{st['name']} ({m_id}) starved by upstream {st['starved_by']} → throughput constrained to {st['effective_uph']} UPH."
                )
            elif st["derate_factor"] < 1.0:
                propagation_chain.append(
                    f"{st['name']} ({m_id}) internally derated to {st['own_capacity_uph']} UPH due to health score ({st['health_score']}%)."
                )

        affected_machines = [
            m_id for m_id, st in node_status.items()
            if st["effective_uph"] < st["nominal_uph"]
        ]

        first_action = (
            f"Prioritize inspection on root cause machine {root_cause_id} "
            f"({node_status[root_cause_id]['name']}) to recover up to {lost_uph} lost UPH across the production line."
            if lost_uph > 0 else
            "All line stations operating at nominal throughput capacity (120 UPH)."
        )

        return {
            "baseline_line_uph": baseline_line_uph,
            "effective_line_uph": effective_line_uph,
            "lost_uph": lost_uph,
            "loss_percentage": loss_pct,
            "estimated_hourly_loss_usd": hourly_loss_usd,
            "root_cause_machine_id": root_cause_id,
            "root_cause_machine_name": node_status[root_cause_id]["name"] if root_cause_id else None,
            "first_action_recommendation": first_action,
            "nodes": list(node_status.values()),
            "edges": [
                {
                    "upstream_id": dep.upstream_id,
                    "downstream_id": dep.downstream_id,
                    "propagation_factor": dep.propagation_factor,
                    "description": dep.description
                }
                for dep in dependencies
            ],
            "affected_machines": affected_machines,
            "propagation_chain": propagation_chain,
            "assumptions": [
                "Single line unbuffered synchronous transfer flow without inter-stage accumulation buffers.",
                "Throughput capacity scales linearly with health score degradation below 90%.",
                f"Production financial loss calculated at ${self.UNIT_MARGIN_USD:.2f} gross margin per unit."
            ]
        }


dependency_service = DependencyService()
