from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.snapshot_service import snapshot_service
from app.core.database import SessionLocal
import asyncio

scheduler = AsyncIOScheduler()

async def run_snapshot_job():
    """Run every 15 minutes"""
    db = SessionLocal()
    try:
        await snapshot_service.save_bike_snapshot(db)
        await snapshot_service.save_station_snapshot(db)
    finally:
        db.close()

def start_scheduler():
    # Run immediately on startup
    asyncio.create_task(run_snapshot_job())
    
    # Then run every 15 minutes
    scheduler.add_job(
        run_snapshot_job,
        'interval',
        minutes=10,
        id='snapshot_job'
    )
    scheduler.start()
    print("Scheduler started - saving snapshots every 15 minutes")