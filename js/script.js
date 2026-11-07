// =====================================
// PAWSITIVE PET ACADEMY
// Main Website Script
// 1. Mobile menu
// 2. Courses dropdown menu
// 3. Course fee calculator
// 4. Contact and enquiry form validation
// =====================================


document.addEventListener("DOMContentLoaded", function () {
    setUpMobileMenu();
    setUpDropdown();
    setUpFeeCalculator();
    setUpFormValidation("contactForm");
    setUpFormValidation("enquiryForm");
});


// Read a value from the page address, e.g. ?course=grooming
function getUrlValue(name) {
    return new URLSearchParams(window.location.search).get(name);
}


// -------------------------------------
// 1. MOBILE MENU
// -------------------------------------

function setUpMobileMenu() {

    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");

    if (!header || !toggle) {
        return;
    }

    toggle.addEventListener("click", function () {
        const isOpen = header.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        toggle.textContent = isOpen ? "Close" : "Menu";
    });
}


// -------------------------------------
// 2. COURSES DROPDOWN MENU
// -------------------------------------

function setUpDropdown() {

    const dropdowns = document.querySelectorAll("details.dropdown");

    if (dropdowns.length === 0) {
        return;
    }

    // Close the dropdown when the user clicks anywhere outside it
    document.addEventListener("click", function (event) {
        dropdowns.forEach(function (dropdown) {
            if (!dropdown.contains(event.target)) {
                dropdown.removeAttribute("open");
            }
        });
    });

    // Close the dropdown when the Escape key is pressed
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            dropdowns.forEach(function (dropdown) {
                if (dropdown.hasAttribute("open")) {
                    dropdown.removeAttribute("open");
                    dropdown.querySelector("summary").focus();
                }
            });
        }
    });

    // Highlight the current page inside the dropdown
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    dropdowns.forEach(function (dropdown) {
        dropdown.querySelectorAll(".dropdown-menu a").forEach(function (link) {
            if (link.getAttribute("href") === currentPage) {
                link.classList.add("current");
                link.setAttribute("aria-current", "page");
            }
        });
    });
}


// -------------------------------------
// 3. COURSE FEE CALCULATOR
// -------------------------------------

function setUpFeeCalculator() {

    const calculator = document.getElementById("feeCalculator");

    // Only run the calculator on the fees page
    if (!calculator) {
        return;
    }

    const checkboxes = calculator.querySelectorAll('input[name="course"]');
    const errorMessage = document.getElementById("calculatorError");

    // Format amounts as South African Rand, e.g. R 1 500,00
    function formatCurrency(amount) {
        return amount.toLocaleString("en-ZA", {
            style: "currency",
            currency: "ZAR"
        });
    }

    function setText(id, text) {
        document.getElementById(id).textContent = text;
    }

    // Work out the fees and show them in the estimate panel
    function updateEstimate() {

        const selected = calculator.querySelectorAll('input[name="course"]:checked');
        const count = selected.length;

        let subtotal = 0;
        const names = [];

        selected.forEach(function (course) {
            const fee = Number(course.value);

            // Error handling: ignore any fee that is not a valid number
            if (!isNaN(fee) && fee > 0) {
                subtotal += fee;
                names.push(course.dataset.name);
            }
        });

        // Discount percentage (whole numbers avoid rounding errors)
        let discountPercent = 0;

        if (count === 1) {
            discountPercent = 5;
        } else if (count === 2) {
            discountPercent = 10;
        } else if (count >= 3) {
            discountPercent = 15;
        }

        const discountAmount = subtotal * discountPercent / 100;

        // Discount is applied before VAT
        const afterDiscount = subtotal - discountAmount;

        // 15% VAT on the discounted total
        const vatAmount = afterDiscount * 15 / 100;

        const finalTotal = afterDiscount + vatAmount;

        // Update the page
        setText("selectedCount", count + " selected");
        setText("estimateCount", count + (count === 1 ? " course" : " courses"));
        setText("subtotal", formatCurrency(subtotal));
        setText("discountLabel", "Discount (" + discountPercent + "%)");
        setText("discount", "− " + formatCurrency(discountAmount));
        setText("afterDiscount", formatCurrency(afterDiscount));
        setText("vat", formatCurrency(vatAmount));
        setText("finalTotal", formatCurrency(finalTotal));

        const courseList = document.getElementById("estimateCourses");

        if (count === 0) {
            courseList.textContent = "Select a course to see your estimate.";
        } else {
            courseList.innerHTML = "";
            const list = document.createElement("ul");
            names.forEach(function (name) {
                const item = document.createElement("li");
                item.textContent = name;
                list.appendChild(item);
            });
            courseList.appendChild(list);
            errorMessage.textContent = "";
        }
    }

    // Pre-select a course when arriving from a course page,
    // e.g. calculate-fees.html?course=grooming
    const preselected = getUrlValue("course");

    if (preselected) {
        const checkbox = document.getElementById(preselected);
        if (checkbox && checkbox.name === "course") {
            checkbox.checked = true;
        }
    }

    // Recalculate every time a checkbox changes
    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", updateEstimate);
    });

    // "Enquire about these courses" button
    calculator.addEventListener("submit", function (event) {

        event.preventDefault();

        const selected = calculator.querySelectorAll('input[name="course"]:checked');

        // Error handling: at least one course must be selected
        if (selected.length === 0) {
            errorMessage.textContent =
                "Please select at least one course before continuing.";
            return;
        }

        // Send the chosen courses to the enquiry form
        const keys = [];
        selected.forEach(function (course) {
            keys.push(course.id);
        });

        window.location.href = "enquiry.html?courses=" + keys.join(",");
    });

    // "Clear selection" button
    calculator.addEventListener("reset", function () {
        errorMessage.textContent = "";
        // Wait until the browser has cleared the checkboxes
        setTimeout(updateEstimate, 0);
    });

    updateEstimate();
}


// -------------------------------------
// 4. FORM VALIDATION (contact + enquiry)
// -------------------------------------

function setUpFormValidation(formId) {

    const form = document.getElementById(formId);

    if (!form) {
        return;
    }

    const successBox = form.querySelector(".form-success");
    const courseGroup = form.querySelector('[data-group="courses"]');

    // Pre-tick courses on the enquiry form when arriving from
    // a course page or the fee calculator,
    // e.g. enquiry.html?course=grooming or ?courses=canine,puppy
    if (courseGroup) {
        const requested = (getUrlValue("courses") || getUrlValue("course") || "").split(",");

        requested.forEach(function (key) {
            const checkbox = document.getElementById("enq-" + key);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }

    // Letters, spaces, hyphens and apostrophes only
    function isValidName(value) {
        return /^[A-Za-zÀ-ÿ' -]+$/.test(value);
    }

    // Validation rules for each field (by id).
    // Each rule returns an error message, or "" if the value is fine.
    const rules = {
        name: function (value) {
            if (value === "") {
                return "Please enter your name.";
            }
            if (value.length < 2) {
                return "Your name must be at least 2 characters long.";
            }
            if (!isValidName(value)) {
                return "Your name can only contain letters, spaces, hyphens and apostrophes.";
            }
            return "";
        },

        surname: function (value) {
            if (value === "") {
                return "Please enter your surname.";
            }
            if (value.length < 2) {
                return "Your surname must be at least 2 characters long.";
            }
            if (!isValidName(value)) {
                return "Your surname can only contain letters, spaces, hyphens and apostrophes.";
            }
            return "";
        },

        email: function (value) {
            if (value === "") {
                return "Please enter your email address.";
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
                return "Please enter a valid email address, for example name@example.com.";
            }
            return "";
        },

        phone: function (value, field) {
            if (value === "") {
                // Only an error if this form marks the phone as required
                return field.hasAttribute("required")
                    ? "Please enter your contact number."
                    : "";
            }
            const digits = value.replace(/[\s()-]/g, "");
            if (!/^(\+27|0)\d{9}$/.test(digits)) {
                return "Please enter a valid South African number, for example 082 123 4567.";
            }
            return "";
        },

        subject: function (value) {
            if (value === "") {
                return "Please enter a subject for your message.";
            }
            return "";
        },

        message: function (value) {
            if (value === "") {
                return "Please enter your message.";
            }
            if (value.length < 10) {
                return "Your message must be at least 10 characters long.";
            }
            return "";
        }
    };

    // Show or clear the error for one field
    function validateField(field) {

        const rule = rules[field.id];

        if (!rule) {
            return true;
        }

        const message = rule(field.value.trim(), field);
        const errorElement = document.getElementById(field.id + "Error");

        if (errorElement) {
            errorElement.textContent = message;
        }

        if (message) {
            field.classList.add("invalid");
            field.setAttribute("aria-invalid", "true");
            return false;
        }

        field.classList.remove("invalid");
        field.removeAttribute("aria-invalid");
        return true;
    }

    // At least one course must be ticked (enquiry form only)
    function validateCourses() {

        if (!courseGroup) {
            return true;
        }

        const ticked = courseGroup.querySelectorAll("input:checked").length;
        const errorElement = document.getElementById("coursesError");

        if (ticked === 0) {
            errorElement.textContent = "Please select at least one course.";
            courseGroup.classList.add("invalid");
            return false;
        }

        errorElement.textContent = "";
        courseGroup.classList.remove("invalid");
        return true;
    }

    const fields = form.querySelectorAll("input:not([type='checkbox']), select, textarea");

    // Re-check a field when the user leaves it or corrects it
    fields.forEach(function (field) {
        field.addEventListener("blur", function () {
            validateField(field);
        });

        field.addEventListener("input", function () {
            if (field.classList.contains("invalid")) {
                validateField(field);
            }
        });
    });

    if (courseGroup) {
        courseGroup.addEventListener("change", function () {
            if (courseGroup.classList.contains("invalid")) {
                validateCourses();
            }
        });
    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        if (successBox) {
            successBox.hidden = true;
            successBox.textContent = "";
        }

        let firstInvalid = null;

        fields.forEach(function (field) {
            const valid = validateField(field);
            if (!valid && !firstInvalid) {
                firstInvalid = field;
            }
        });

        const coursesValid = validateCourses();

        if (!coursesValid && !firstInvalid) {
            firstInvalid = courseGroup.querySelector("input");
        }

        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }

        // All fields are valid: show a confirmation message.
        // No backend exists, so nothing is actually sent.
        const name = form.querySelector("#name").value.trim();
        const confirmation = form.dataset.success ||
            "Your form has been completed successfully.";

        if (successBox) {
            successBox.textContent = "Thank you, " + name + "! " + confirmation;
            successBox.hidden = false;
            successBox.focus();
        }

        form.reset();
    });
}