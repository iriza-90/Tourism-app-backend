document.addEventListener("DOMContentLoaded", () => {
    const bookingForm = document.getElementById("bookingForm");
  
    bookingForm.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const formData = new FormData(bookingForm);
  
      const travelData = {};
      formData.forEach((value, key) => {
        travelData[key] = value;
      });
  
      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(travelData),
        });
  
        if (!response.ok) {
          throw new Error("Error in form submission");
        }
  
        const data = await response.json();
        alert(data.message);
        bookingForm.reset();
      } catch (error) {
        console.error(error);
        alert("Error submitting the form. Please try again later.");
      }
    });
  });
  