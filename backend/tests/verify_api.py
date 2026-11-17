import asyncio
import httpx
from app.main import app


async def test():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
        r = await c.get("/health")
        print("Health status:", r.status_code, r.json())
        r = client_layout = await c.get("/api/factory/layout")
        print("Layout status:", client_layout.status_code, len(client_layout.json()["machines"]))
        r = await c.get("/api/machines")
        print("Machines count:", len(r.json()))


if __name__ == "__main__":
    asyncio.run(test())
