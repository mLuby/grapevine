import requests, random, time

for i in range(10000):
  contribution = random.randint(1, 100)
  payload = {'total': contribution}
  requests.post("http://localhost:3000/message", json=payload) 

  time.sleep(0.1)
  print "Made {0} requests.".format(i+1)

