const LAWYER_BASE_URL = "http://localhost:5000/api/users/lawyers";

/**
 * Fetches a list of lawyers from the API
 * @returns {Promise<Array>} A promise that resolves to an array of lawyer objects
 * @throws {Error} If the HTTP request fails
 */
export async function getLawyer() {
  const token = localStorage.getItem("token");
  console.log(token);
  const response = await fetch(LAWYER_BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Check if response is OK
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.lawyers;
}
