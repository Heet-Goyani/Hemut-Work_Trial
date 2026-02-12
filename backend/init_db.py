"""
Initialize database with sample data
"""
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
from models import Customer, Order, Stop
from datetime import datetime, timedelta

def init_sample_data():
    """Create sample customers and orders"""
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists and clear it
        if db.query(Customer).count() > 0:
            print("Clearing existing data...")
            db.query(Stop).delete()
            db.query(Order).delete()
            db.query(Customer).delete()
            db.commit()
            print("Existing data cleared.")
        
        # Create sample customers
        customers = [
            Customer(
                name="Acme Corporation",
                email="contact@acme.com",
                phone="+1-555-0101",
                address="123 Business St, New York, NY 10001"
            ),
            Customer(
                name="TechStart Inc",
                email="hello@techstart.com",
                phone="+1-555-0102",
                address="456 Innovation Ave, San Francisco, CA 94102"
            ),
            Customer(
                name="Global Logistics LLC",
                email="info@globallog.com",
                phone="+1-555-0103",
                address="789 Trade Blvd, Chicago, IL 60601"
            ),
            Customer(
                name="Midwest Manufacturing Co",
                email="sales@midwestmfg.com",
                phone="+1-555-0104",
                address="2500 Industrial Dr, Detroit, MI 48201"
            ),
            Customer(
                name="Coastal Shipping Partners",
                email="dispatch@coastalship.com",
                phone="+1-555-0105",
                address="8900 Harbor Blvd, Los Angeles, CA 90001"
            ),
            Customer(
                name="Rocky Mountain Freight",
                email="orders@rmfreight.com",
                phone="+1-555-0106",
                address="1750 Mountain View Rd, Denver, CO 80202"
            ),
            Customer(
                name="Southern Express Lines",
                email="info@southernexpress.com",
                phone="+1-555-0107",
                address="4200 Peachtree St, Atlanta, GA 30303"
            ),
            Customer(
                name="Northeast Distribution Inc",
                email="contact@nedist.com",
                phone="+1-555-0108",
                address="900 Commerce Park, Boston, MA 02101"
            ),
            Customer(
                name="Texas Star Logistics",
                email="dispatch@txstarlog.com",
                phone="+1-555-0109",
                address="5500 Ranch Rd, Houston, TX 77001"
            ),
            Customer(
                name="Pacific Northwest Carriers",
                email="hello@pnwcarriers.com",
                phone="+1-555-0110",
                address="3300 Pike St, Seattle, WA 98101"
            ),
        ]
        
        db.add_all(customers)
        db.commit()
        
        # Create sample orders with stops
        now = datetime.now()
        
        # Order 1: New York to Philadelphia
        order1 = Order(
            customer_id=customers[0].id,
            pickup_location="New York, NY",
            delivery_location="Philadelphia, PA",
            pickup_date=now + timedelta(days=1),
            delivery_date=now + timedelta(days=1, hours=6),
            cargo_type="Office Furniture",
            weight=3500,
            dimensions="300x200x180 cm",
            vehicle_type="Dry Van",
            contact_person="Michael Chen",
            contact_phone="+1-212-555-1001",
            contact_email="m.chen@acme.com",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-74.0060, 40.7128], [-75.1652, 39.9526]]
            },
            bill_of_lading="BOL-2024-001",
            container_number="CONT-001",
            carrier="FastFreight Inc",
            reference_number="REF-001",
            po_number="PO-10001",
            status="pending",
            special_instructions="Deliver to loading dock B"
        )
        db.add(order1)
        db.flush()
        
        stops1 = [
            Stop(order_id=order1.id, sequence=1, location="New York, NY - Manhattan Warehouse",
                 stop_type="pickup", scheduled_time=now + timedelta(days=1, hours=8),
                 contact_person="Michael Chen", contact_phone="+1-212-555-1001",
                 latitude=40.7128, longitude=-74.0060),
            Stop(order_id=order1.id, sequence=2, location="Philadelphia, PA - Center City Office",
                 stop_type="delivery", scheduled_time=now + timedelta(days=1, hours=14),
                 contact_person="Sarah Williams", contact_phone="+1-215-555-1002",
                 latitude=39.9526, longitude=-75.1652),
        ]
        db.add_all(stops1)
        
        # Order 2: Los Angeles to San Francisco
        order2 = Order(
            customer_id=customers[1].id,
            pickup_location="Los Angeles, CA",
            delivery_location="San Francisco, CA",
            pickup_date=now + timedelta(days=2),
            delivery_date=now + timedelta(days=3),
            cargo_type="Electronics",
            weight=5000,
            dimensions="250x150x120 cm",
            vehicle_type="Refrigerated",
            contact_person="David Park",
            contact_phone="+1-310-555-2001",
            contact_email="d.park@techstart.com",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-118.2437, 34.0522], [-122.4194, 37.7749]]
            },
            carrier="Express Delivery Co",
            reference_number="REF-002",
            status="pending",
            bill_of_lading="BOL-2024-002"
        )
        db.add(order2)
        db.flush()
        
        stops2 = [
            Stop(order_id=order2.id, sequence=1, location="Los Angeles, CA - Silicon Beach Hub",
                 stop_type="pickup", scheduled_time=now + timedelta(days=2, hours=9),
                 contact_person="David Park", contact_phone="+1-310-555-2001",
                 latitude=34.0522, longitude=-118.2437),
            Stop(order_id=order2.id, sequence=2, location="San Francisco, CA - Tech Campus",
                 stop_type="delivery", scheduled_time=now + timedelta(days=3, hours=15),
                 contact_person="Jennifer Lee", contact_phone="+1-415-555-2002",
                 latitude=37.7749, longitude=-122.4194),
        ]
        db.add_all(stops2)
        
        # Order 3: Chicago to Detroit
        order3 = Order(
            customer_id=customers[2].id,
            pickup_location="Chicago, IL",
            delivery_location="Detroit, MI",
            pickup_date=now + timedelta(days=1),
            delivery_date=now + timedelta(days=2),
            cargo_type="Auto Parts",
            weight=12000,
            dimensions="400x250x200 cm",
            vehicle_type="Flatbed",
            contact_person="Robert Johnson",
            contact_phone="+1-312-555-3001",
            contact_email="r.johnson@globallog.com",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-87.6298, 41.8781], [-83.0458, 42.3314]]
            },
            status="in_progress",
            carrier="Midwest Trucking",
            bill_of_lading="BOL-2024-003",
            po_number="PO-10003",
            special_instructions="Expedited delivery required"
        )
        db.add(order3)
        db.flush()
        
        stops3 = [
            Stop(order_id=order3.id, sequence=1, location="Chicago, IL - South Side Warehouse",
                 stop_type="pickup", scheduled_time=now + timedelta(days=1, hours=7),
                 contact_person="Robert Johnson", contact_phone="+1-312-555-3001",
                 latitude=41.8781, longitude=-87.6298, status="completed"),
            Stop(order_id=order3.id, sequence=2, location="Detroit, MI - Auto Plant",
                 stop_type="delivery", scheduled_time=now + timedelta(days=2, hours=12),
                 contact_person="Emily Davis", contact_phone="+1-313-555-3002",
                 latitude=42.3314, longitude=-83.0458),
        ]
        db.add_all(stops3)
        
        # Order 4: Miami to Atlanta
        order4 = Order(
            customer_id=customers[6].id,
            pickup_location="Miami, FL",
            delivery_location="Atlanta, GA",
            pickup_date=now + timedelta(days=3),
            delivery_date=now + timedelta(days=4),
            cargo_type="Perishable Goods",
            weight=8500,
            dimensions="350x220x180 cm",
            vehicle_type="Refrigerated",
            contact_person="Carlos Rodriguez",
            contact_phone="+1-305-555-4001",
            contact_email="c.rodriguez@southernexpress.com",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-80.1918, 25.7617], [-84.3880, 33.7490]]
            },
            status="pending",
            carrier="Cold Chain Express",
            special_instructions="Temperature controlled - keep at 2-8°C",
            bill_of_lading="BOL-2024-004",
            reference_number="REF-004"
        )
        db.add(order4)
        db.flush()
        
        stops4 = [
            Stop(order_id=order4.id, sequence=1, location="Miami, FL - Port Everglades",
                 stop_type="pickup", scheduled_time=now + timedelta(days=3, hours=6),
                 contact_person="Carlos Rodriguez", contact_phone="+1-305-555-4001",
                 latitude=25.7617, longitude=-80.1918),
            Stop(order_id=order4.id, sequence=2, location="Atlanta, GA - Distribution Center",
                 stop_type="delivery", scheduled_time=now + timedelta(days=4, hours=14),
                 contact_person="Amanda White", contact_phone="+1-404-555-4002",
                 latitude=33.7490, longitude=-84.3880),
        ]
        db.add_all(stops4)
        
        # Order 5: Houston to Dallas
        order5 = Order(
            customer_id=customers[8].id,
            pickup_location="Houston, TX",
            delivery_location="Dallas, TX",
            pickup_date=now + timedelta(days=2),
            delivery_date=now + timedelta(days=2, hours=8),
            cargo_type="Construction Materials",
            weight=18000,
            dimensions="500x300x250 cm",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-95.3698, 29.7604], [-96.7970, 32.7767]]
            },
            status="completed",
            carrier="Texas Star Transport",
            bill_of_lading="BOL-2024-005",
            po_number="PO-10005",
            container_number="CONT-005"
        )
        db.add(order5)
        db.flush()
        
        stops5 = [
            Stop(order_id=order5.id, sequence=1, location="Houston, TX - Industrial Park",
                 stop_type="pickup", scheduled_time=now + timedelta(days=2, hours=7),
                 contact_person="William Brown", contact_phone="+1-713-555-5001",
                 latitude=29.7604, longitude=-95.3698, status="completed"),
            Stop(order_id=order5.id, sequence=2, location="Dallas, TX - Construction Site",
                 stop_type="delivery", scheduled_time=now + timedelta(days=2, hours=15),
                 contact_person="Jessica Martinez", contact_phone="+1-214-555-5002",
                 latitude=32.7767, longitude=-96.7970, status="completed"),
        ]
        db.add_all(stops5)
        
        # Order 6: Seattle to Portland
        order6 = Order(
            customer_id=customers[9].id,
            pickup_location="Seattle, WA",
            delivery_location="Portland, OR",
            pickup_date=now + timedelta(days=4),
            delivery_date=now + timedelta(days=4, hours=6),
            cargo_type="Coffee & Beverages",
            weight=6500,
            dimensions="280x180x160 cm",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-122.3321, 47.6062], [-122.6765, 45.5152]]
            },
            status="pending",
            carrier="Pacific Northwest Freight",
            reference_number="REF-006",
            special_instructions="Fragile - handle with care"
        )
        db.add(order6)
        db.flush()
        
        stops6 = [
            Stop(order_id=order6.id, sequence=1, location="Seattle, WA - Coffee Roastery",
                 stop_type="pickup", scheduled_time=now + timedelta(days=4, hours=8),
                 contact_person="Thomas Anderson", contact_phone="+1-206-555-6001",
                 latitude=47.6062, longitude=-122.3321),
            Stop(order_id=order6.id, sequence=2, location="Portland, OR - Retail Warehouse",
                 stop_type="delivery", scheduled_time=now + timedelta(days=4, hours=14),
                 contact_person="Rebecca Garcia", contact_phone="+1-503-555-6002",
                 latitude=45.5152, longitude=-122.6765),
        ]
        db.add_all(stops6)
        
        # Order 7: Boston to Washington DC
        order7 = Order(
            customer_id=customers[7].id,
            pickup_location="Boston, MA",
            delivery_location="Washington, DC",
            pickup_date=now + timedelta(days=1),
            delivery_date=now + timedelta(days=2),
            cargo_type="Medical Supplies",
            weight=4500,
            dimensions="220x180x150 cm",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-71.0589, 42.3601], [-77.0369, 38.9072]]
            },
            status="in_progress",
            carrier="MedExpress Delivery",
            bill_of_lading="BOL-2024-007",
            po_number="PO-10007",
            special_instructions="Priority delivery - medical supplies"
        )
        db.add(order7)
        db.flush()
        
        stops7 = [
            Stop(order_id=order7.id, sequence=1, location="Boston, MA - Medical Center",
                 stop_type="pickup", scheduled_time=now + timedelta(days=1, hours=9),
                 contact_person="Dr. Patricia Wilson", contact_phone="+1-617-555-7001",
                 latitude=42.3601, longitude=-71.0589, status="completed"),
            Stop(order_id=order7.id, sequence=2, location="Washington, DC - Hospital Campus",
                 stop_type="delivery", scheduled_time=now + timedelta(days=2, hours=11),
                 contact_person="Dr. James Taylor", contact_phone="+1-202-555-7002",
                 latitude=38.9072, longitude=-77.0369),
        ]
        db.add_all(stops7)
        
        # Order 8: Denver to Phoenix
        order8 = Order(
            customer_id=customers[5].id,
            pickup_location="Denver, CO",
            delivery_location="Phoenix, AZ",
            pickup_date=now + timedelta(days=5),
            delivery_date=now + timedelta(days=6),
            cargo_type="Sporting Goods",
            weight=7200,
            dimensions="320x200x180 cm",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-104.9903, 39.7392], [-112.0740, 33.4484]]
            },
            status="pending",
            carrier="Mountain High Transport",
            reference_number="REF-008",
            bill_of_lading="BOL-2024-008"
        )
        db.add(order8)
        db.flush()
        
        stops8 = [
            Stop(order_id=order8.id, sequence=1, location="Denver, CO - Sports Warehouse",
                 stop_type="pickup", scheduled_time=now + timedelta(days=5, hours=10),
                 contact_person="Christopher Moore", contact_phone="+1-303-555-8001",
                 latitude=39.7392, longitude=-104.9903),
            Stop(order_id=order8.id, sequence=2, location="Phoenix, AZ - Retail Distribution",
                 stop_type="delivery", scheduled_time=now + timedelta(days=6, hours=13),
                 contact_person="Michelle Thompson", contact_phone="+1-602-555-8002",
                 latitude=33.4484, longitude=-112.0740),
        ]
        db.add_all(stops8)
        
        # Order 9: Minneapolis to Milwaukee
        order9 = Order(
            customer_id=customers[3].id,
            pickup_location="Minneapolis, MN",
            delivery_location="Milwaukee, WI",
            pickup_date=now + timedelta(days=3),
            delivery_date=now + timedelta(days=3, hours=10),
            cargo_type="Dairy Products",
            weight=9500,
            dimensions="380x240x200 cm",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-93.2650, 44.9778], [-87.9065, 43.0389]]
            },
            status="pending",
            carrier="Midwest Refrigerated",
            special_instructions="Keep refrigerated at all times",
            bill_of_lading="BOL-2024-009",
            po_number="PO-10009"
        )
        db.add(order9)
        db.flush()
        
        stops9 = [
            Stop(order_id=order9.id, sequence=1, location="Minneapolis, MN - Dairy Farm",
                 stop_type="pickup", scheduled_time=now + timedelta(days=3, hours=5),
                 contact_person="Daniel Anderson", contact_phone="+1-612-555-9001",
                 latitude=44.9778, longitude=-93.2650),
            Stop(order_id=order9.id, sequence=2, location="Milwaukee, WI - Food Processing",
                 stop_type="delivery", scheduled_time=now + timedelta(days=3, hours=15),
                 contact_person="Laura Jackson", contact_phone="+1-414-555-9002",
                 latitude=43.0389, longitude=-87.9065),
        ]
        db.add_all(stops9)
        
        # Order 10: San Diego to Las Vegas
        order10 = Order(
            customer_id=customers[4].id,
            pickup_location="San Diego, CA",
            delivery_location="Las Vegas, NV",
            pickup_date=now + timedelta(days=6),
            delivery_date=now + timedelta(days=7),
            cargo_type="Hotel Supplies",
            weight=5800,
            dimensions="290x190x170 cm",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-117.1611, 32.7157], [-115.1398, 36.1699]]
            },
            status="pending",
            carrier="Desert Express",
            reference_number="REF-010",
            container_number="CONT-010"
        )
        db.add(order10)
        db.flush()
        
        stops10 = [
            Stop(order_id=order10.id, sequence=1, location="San Diego, CA - Wholesale Center",
                 stop_type="pickup", scheduled_time=now + timedelta(days=6, hours=8),
                 contact_person="Mark Harris", contact_phone="+1-619-555-1001",
                 latitude=32.7157, longitude=-117.1611),
            Stop(order_id=order10.id, sequence=2, location="Las Vegas, NV - Hotel Complex",
                 stop_type="delivery", scheduled_time=now + timedelta(days=7, hours=16),
                 contact_person="Nicole Clark", contact_phone="+1-702-555-1002",
                 latitude=36.1699, longitude=-115.1398),
        ]
        db.add_all(stops10)
        
        # Order 11: Nashville to Memphis
        order11 = Order(
            customer_id=customers[6].id,
            pickup_location="Nashville, TN",
            delivery_location="Memphis, TN",
            pickup_date=now + timedelta(days=2),
            delivery_date=now + timedelta(days=2, hours=8),
            cargo_type="Musical Instruments",
            weight=4200,
            dimensions="260x160x140 cm",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-86.7816, 36.1627], [-90.0490, 35.1495]]
            },
            status="delivered",
            carrier="Sound Transit",
            bill_of_lading="BOL-2024-011",
            reference_number="REF-011",
            special_instructions="Extremely fragile - climate controlled"
        )
        db.add(order11)
        db.flush()
        
        stops11 = [
            Stop(order_id=order11.id, sequence=1, location="Nashville, TN - Music Row",
                 stop_type="pickup", scheduled_time=now + timedelta(days=2, hours=9),
                 contact_person="Kevin Lewis", contact_phone="+1-615-555-1101",
                 latitude=36.1627, longitude=-86.7816, status="completed"),
            Stop(order_id=order11.id, sequence=2, location="Memphis, TN - Concert Hall",
                 stop_type="delivery", scheduled_time=now + timedelta(days=2, hours=17),
                 contact_person="Angela Walker", contact_phone="+1-901-555-1102",
                 latitude=35.1495, longitude=-90.0490, status="completed"),
        ]
        db.add_all(stops11)
        
        # Order 12: Charlotte to Raleigh
        order12 = Order(
            customer_id=customers[0].id,
            pickup_location="Charlotte, NC",
            delivery_location="Raleigh, NC",
            pickup_date=now + timedelta(days=4),
            delivery_date=now + timedelta(days=4, hours=7),
            cargo_type="Pharmaceuticals",
            weight=3800,
            dimensions="200x150x130 cm",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-80.8431, 35.2271], [-78.6382, 35.7796]]
            },
            status="in_progress",
            carrier="PharmaLogix",
            bill_of_lading="BOL-2024-012",
            po_number="PO-10012",
            special_instructions="Controlled substances - security required"
        )
        db.add(order12)
        db.flush()
        
        stops12 = [
            Stop(order_id=order12.id, sequence=1, location="Charlotte, NC - Pharma Lab",
                 stop_type="pickup", scheduled_time=now + timedelta(days=4, hours=7),
                 contact_person="Dr. Brian Young", contact_phone="+1-704-555-1201",
                 latitude=35.2271, longitude=-80.8431, status="completed"),
            Stop(order_id=order12.id, sequence=2, location="Raleigh, NC - Medical Facility",
                 stop_type="delivery", scheduled_time=now + timedelta(days=4, hours=14),
                 contact_person="Dr. Maria Allen", contact_phone="+1-919-555-1202",
                 latitude=35.7796, longitude=-78.6382),
        ]
        db.add_all(stops12)
        
        # Order 13: Kansas City to St. Louis
        order13 = Order(
            customer_id=customers[2].id,
            pickup_location="Kansas City, MO",
            delivery_location="St. Louis, MO",
            pickup_date=now + timedelta(days=7),
            delivery_date=now + timedelta(days=7, hours=8),
            cargo_type="Packaged Foods",
            weight=11000,
            dimensions="420x260x220 cm",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-94.5786, 39.0997], [-90.1994, 38.6270]]
            },
            status="pending",
            carrier="Heartland Freight",
            reference_number="REF-013",
            bill_of_lading="BOL-2024-013"
        )
        db.add(order13)
        db.flush()
        
        stops13 = [
            Stop(order_id=order13.id, sequence=1, location="Kansas City, MO - Food Processing",
                 stop_type="pickup", scheduled_time=now + timedelta(days=7, hours=6),
                 contact_person="Steven King", contact_phone="+1-816-555-1301",
                 latitude=39.0997, longitude=-94.5786),
            Stop(order_id=order13.id, sequence=2, location="St. Louis, MO - Distribution Hub",
                 stop_type="delivery", scheduled_time=now + timedelta(days=7, hours=14),
                 contact_person="Samantha Scott", contact_phone="+1-314-555-1302",
                 latitude=38.6270, longitude=-90.1994),
        ]
        db.add_all(stops13)
        
        # Order 14: Pittsburgh to Cleveland
        order14 = Order(
            customer_id=customers[3].id,
            pickup_location="Pittsburgh, PA",
            delivery_location="Cleveland, OH",
            pickup_date=now + timedelta(days=5),
            delivery_date=now + timedelta(days=5, hours=6),
            cargo_type="Steel Products",
            weight=24000,
            dimensions="550x350x280 cm",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-79.9959, 40.4406], [-81.6944, 41.4993]]
            },
            status="pending",
            carrier="Steel Belt Transport",
            bill_of_lading="BOL-2024-014",
            po_number="PO-10014",
            container_number="CONT-014",
            special_instructions="Heavy load - requires flatbed"
        )
        db.add(order14)
        db.flush()
        
        stops14 = [
            Stop(order_id=order14.id, sequence=1, location="Pittsburgh, PA - Steel Mill",
                 stop_type="pickup", scheduled_time=now + timedelta(days=5, hours=7),
                 contact_person="Richard Green", contact_phone="+1-412-555-1401",
                 latitude=40.4406, longitude=-79.9959),
            Stop(order_id=order14.id, sequence=2, location="Cleveland, OH - Manufacturing Plant",
                 stop_type="delivery", scheduled_time=now + timedelta(days=5, hours=13),
                 contact_person="Christine Adams", contact_phone="+1-216-555-1402",
                 latitude=41.4993, longitude=-81.6944),
        ]
        db.add_all(stops14)
        
        # Order 15: Salt Lake City to Boise
        order15 = Order(
            customer_id=customers[5].id,
            pickup_location="Salt Lake City, UT",
            delivery_location="Boise, ID",
            pickup_date=now + timedelta(days=8),
            delivery_date=now + timedelta(days=9),
            cargo_type="Outdoor Equipment",
            weight=6800,
            dimensions="310x210x190 cm",
            route_geometry={
                "type": "LineString",
                "coordinates": [[-111.8910, 40.7608], [-116.2146, 43.6150]]
            },
            status="pending",
            carrier="Mountain Trail Logistics",
            reference_number="REF-015",
            bill_of_lading="BOL-2024-015"
        )
        db.add(order15)
        db.flush()
        
        stops15 = [
            Stop(order_id=order15.id, sequence=1, location="Salt Lake City, UT - Outdoor Outfitters",
                 stop_type="pickup", scheduled_time=now + timedelta(days=8, hours=9),
                 contact_person="Ryan Baker", contact_phone="+1-801-555-1501",
                 latitude=40.7608, longitude=-111.8910),
            Stop(order_id=order15.id, sequence=2, location="Boise, ID - Adventure Store",
                 stop_type="delivery", scheduled_time=now + timedelta(days=9, hours=15),
                 contact_person="Melissa Nelson", contact_phone="+1-208-555-1502",
                 latitude=43.6150, longitude=-116.2146),
        ]
        db.add_all(stops15)
        
        db.commit()
        print("✅ Sample data created successfully!")
        print(f"   - {len(customers)} customers")
        print(f"   - 15 orders with stops")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database with sample data...")
    init_sample_data()
