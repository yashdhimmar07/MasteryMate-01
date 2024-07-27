document.addEventListener("DOMContentLoaded", function() {
    const passwordField = document.getElementById("password");
    const strengthMeter = document.getElementById("password-strength");
    const passwordMessage = document.getElementById("password-message");
    const submitButton = document.querySelector("button[type='submit']");

    // Define password strength criteria
    const strengthCriteria = {
        0: "Very Weak",
        1: "Weak",
        2: "Moderate",
        3: "Strong",
        4: "Very Strong",
        5: "Extreme Strong"
    };

    // Function to calculate password strength
    function calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[$&+,:;=?@#|'<>.^*()%!-]/)) strength++;
        return strength;
    }

    // Event listener for the password field
    passwordField.addEventListener("input", function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);

        // Update password strength display
        strengthMeter.textContent = `Password Strength: ${strengthCriteria[strength]}`;

        // Hide password strength meter when password is filled and not focused
        if (password.length > 0 && !passwordField.matches(":focus")) {
            strengthMeter.style.display = "none";
        } else {
            strengthMeter.style.display = "block";
        }

        // Enable or disable submit button based on password strength
        submitButton.disabled = (strength < 5);

        // Update password message based on strength
        if (strength < 5) {
            passwordMessage.textContent = "Password should be extreme strong. Add more characters, including uppercase, lowercase, numbers, and special characters.";
            passwordMessage.style.color = "red";
        } else {
            passwordMessage.textContent = "";
        }
    });

    // Event listener to hide password strength meter on focus out
    passwordField.addEventListener("focusout", function() {
        const password = this.value;
        if (password.length > 0) {
            strengthMeter.style.display = "none";
        }
    });
});
