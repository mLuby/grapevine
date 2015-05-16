# grapevine
Peer-to-peer pub-sub

1. Assign the `grapevine` class to DOM elements you want kept up-to-date.
  ```html
  <h1 class="grapevine visits">475 visits</h1>
  <input type="number" class="credit-card" />
  ```
2. grapevine keeps track of these elements' values (and in v2, attributes).
3. when a new page is requested, grapevine includes a list of peers in the response.
4. if any grapevine elements changed since last page request, grapevine orders the requesting client to update its peers.
5. peers receive updates, verify they are from the server, and update their appropriate DOM elements.
