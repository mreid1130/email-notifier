# email notification system
http://star-wars-notifier.herokuapp.com/

**Subscribe to get alert for movie**
----
  API allows users to subscribe and get an email notification within minutes of your favorite movie's release on primewire.ag.

* **URL**

  `/subscribe`

* **Method:**

  `POST`

*  **URL Params**

   **Required:**

   `title=[String]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `"subscription creation complete"`

* **Error Response:**


  * **Code:** 400 <br />
    **Content:** `{ error : "Missing parameters" }`
