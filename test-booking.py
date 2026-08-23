import urllib.request, json, time

API_URL = "https://ticket-booking-system-paradox-ticke.vercel.app/api"

try:
    print("1. Logging in...")
    data = json.dumps({"email": "demo@example.com", "password": "password123"}).encode('utf-8')
    req = urllib.request.Request(f"{API_URL}/auth/login", data=data, headers={"Content-Type": "application/json"})
    res = urllib.request.urlopen(req)
    token = json.loads(res.read())['token']

    print("2. Getting seats...")
    req = urllib.request.Request(f"{API_URL}/shows/1/seats", headers={"Authorization": f"Bearer {token}"})
    seats = json.loads(urllib.request.urlopen(req).read())
    avail = [s for s in seats if s['status'] == 'available']
    if not avail:
        print("No available seats found!")
        exit(1)
    seat_ids = [avail[0]['id']]

    print(f"3. Holding seat {seat_ids}...")
    data = json.dumps({"seatIds": seat_ids, "total": 2500}).encode('utf-8')
    req = urllib.request.Request(f"{API_URL}/shows/1/holds", data=data, headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    hold = json.loads(urllib.request.urlopen(req).read())
    hold_id = hold['id']

    print(f"4. Booking ticket to shlokebinani@gmail.com...")
    data = json.dumps({"holdId": hold_id, "paymentMethod": "wallet", "email": "shlokebinani@gmail.com", "foodItems": [], "total": 2500}).encode('utf-8')
    req = urllib.request.Request(f"{API_URL}/bookings", data=data, headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    booking = urllib.request.urlopen(req).read()
    
    print("Success:")
    print(json.loads(booking))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
