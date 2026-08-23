import urllib.request
try:
    print(urllib.request.urlopen("https://ticket-booking-system-paradox-ticke.vercel.app/api/events").read())
except Exception as e:
    print(e)
    if hasattr(e, 'read'):
        print(e.read())
