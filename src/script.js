const stringify = require("fast-json-stable-stringify");
const {
    CompatSource
} = require("webpack-sources");

window.onload = async function () {

    //Check which page is loaded and only execute that code
    if (document.getElementById('kapsalon-datalist')) {
        await loadKapsalonsHomepage();
    }
    if (document.getElementById('kapsalon-info-section')) {
        await loadKapsalonInfo();
    }
    if (document.getElementById('insert-code-container')) {
        await validateCode();
    }
    if (document.getElementById('rate-form')) {
        await rateKapsalon();
    }
    if (document.getElementById('kapsalon-admin-list')) {
        await loadKapsalonsAdmin();
    }
    if (document.getElementById('login-admin')) {
        await loginAdmin();
    }

    async function loadKapsalonsHomepage() {
        let kapsalonList = [];

        //fetch all kapsalons
        await fetch('https://web2-kapsamazing-driesv.herokuapp.com/kapsalons')
            .then(response => {
                return response.json();
            })
            .then(data => {
                kapsalonList = data;

                //sort and render the kapsalons for the very first time on rating (default)
                sortKapsalons(kapsalonList, "rating");
                renderKapsalonList(kapsalonList);
            })

        //if filters or searchfield changes, update the list
        if (document.getElementById('search-location-form')) {
            document.getElementById('search-location-form').addEventListener('submit', e => {
                e.preventDefault();
                if (document.getElementById('search-location-input').value != "") {
                    updateLocation(kapsalonList);
                }
            })
        }

        if (document.getElementById('filter-type-form')) {
            document.getElementById('filter-type-form').addEventListener('change', e => {
                e.preventDefault();
                if (document.getElementById('search-location-input').value != "") {
                    updateLocation(kapsalonList);
                } else {
                    updateList(kapsalonList);
                }
            })
        }

        if (document.getElementById('filter-options-form')) {
            document.getElementById('filter-options-form').addEventListener('change', e => {
                e.preventDefault();
                if (document.getElementById('search-location-input').value != "") {
                    updateLocation(kapsalonList);
                } else {
                    updateList(kapsalonList);
                }
            })
        }

        if (document.getElementById('order-by-form')) {
            document.getElementById('order-by-form').addEventListener('change', e => {
                e.preventDefault();
                if (document.getElementById('search-location-input').value != "") {
                    updateLocation(kapsalonList);
                } else {
                    updateList(kapsalonList);
                }
            })
        }
    }

    async function loadKapsalonInfo() {
        let kapsalonInfo;

        //fetch kapsalon that has been selected in the list
        await fetch(`https://web2-kapsamazing-driesv.herokuapp.com/kapsalon/${localStorage.kapsalonId}`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                kapsalonInfo = data;
            })

        //load content of that specific kapsalon
        if (document.getElementById('kapsalon-info-section')) {
            document.getElementById('kapsalon-info-section').innerHTML = `
                <figure class="kapsalon-info-figure">
                <img class="kapsalon-info-img" src="${kapsalonInfo.image}" alt="kapsalon from ${kapsalonInfo.restaurant}">
            </figure>
            <div id="kapsalon-info-container">
                <div id="kapsalon-info-header">
                    <div id="kapsalon-info-header-text">
                        <h3 id="kapsalon-info-header-title">${kapsalonInfo.name}</h3>
                        <div id="kapsalon-info-header-restaurant">
                            <div id="info-header-restaurant-name">${kapsalonInfo.restaurant}</div>
                            <div id="info-header-restaurant-distance">${kapsalonInfo.city}</div>
                        </div>
                    </div>
                    <div id="kapsalon-info-header-rating">
                        <div class="kapsalon-article-rating-number">${calculateGeneralScore(kapsalonInfo.ratings)}
                    </div>
                </div>
                <div id="kapsalon-info-scores">
                    <h4 id="kapsalon-info-scores-title">Scores</h4>
                    <div id="info-scores-content">
                        <div id="info-scores-toppic">
                            <div>Fries</div>
                            <div>Meat</div>
                            <div>Toppings</div>
                        </div>
                        <div id="info-scores-number">
                            <div>${calculateIngredientScore("fries", kapsalonInfo.ratings)}</div>
                            <div>${calculateIngredientScore("meat", kapsalonInfo.ratings)}</div>
                            <div>${calculateIngredientScore("toppings", kapsalonInfo.ratings)}</div>
                        </div>
                        <div id="info-scores-stars">
                            <div>${calculateStars(parseFloat(calculateIngredientScore("fries", kapsalonInfo.ratings)))}</div>
                            <div>${calculateStars(parseFloat(calculateIngredientScore("meat", kapsalonInfo.ratings)))}</div>
                            <div>${calculateStars(parseFloat(calculateIngredientScore("toppings", kapsalonInfo.ratings)))}</div>
                        </div>
                    </div>
                </div>
                <div id="kapsalon-info-order">
                    <a href="${kapsalonInfo.link}" target="_blank">Order</a>
                    <div>€${kapsalonInfo.price}</div>
                </div>
            </div>
                `;

            //adjust the rest of the page to the rest of the info
            document.getElementById('other-meals-title').innerHTML = `
                Other meals from ${kapsalonInfo.restaurant}
                `;

            //fetch all other kapsalons of that restaurant
            fetch('https://web2-kapsamazing-driesv.herokuapp.com/kapsalons')
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    kapsalonList = data;
                    filterKapsalonsRestaurant(kapsalonList, kapsalonInfo.restaurant, kapsalonInfo.city, kapsalonInfo._id);
                    renderKapsalonList(kapsalonList);
                })

            //show location of the restaurant of this kapsalon
            showLocation(kapsalonInfo);
        }
    }

    async function validateCode() {
        if (document.getElementById('insert-code-form')) {

            let kapid;
            let kapsalonId;

            document.getElementById('insert-code-form').addEventListener('submit', e => {
                e.preventDefault('submit');
                kapid = document.getElementById('insert-code-input').value;

                //fetch kapsalon with submitted kapid (6 digits) and save the _id in localstorage
                fetch(`https://web2-kapsamazing-driesv.herokuapp.com/kapsalon/?id=${kapid}`)
                    .then(response => {
                        return response.json();
                    })
                    .then(data => {
                        kapsalonId = data._id;

                        localStorage.setItem("kapsalonId", kapsalonId);

                        window.location.href = './rate.html'
                    })
                    .catch(error => {
                        alert("This is not a valid code, please try another combination");
                    })
            })
        }
    }

    async function rateKapsalon() {
        let kapsalonInfo;

        //fetch the kapsalon saved in localstore
        await fetch(`https://web2-kapsamazing-driesv.herokuapp.com/kapsalon/${localStorage.kapsalonId}`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                kapsalonInfo = data;
            })

        if (document.getElementById('rate-form')) {

            //adjust page to this specific kapsalon
            document.getElementById("rate-title").innerHTML = `Rate "${kapsalonInfo.name}" from "${kapsalonInfo.restaurant}"`;
            document.getElementById("rate-kapsalon-figure").innerHTML = `<img class="kapsalon-info-img" src="${kapsalonInfo.image}" alt="Kapsalon from ${kapsalonInfo.restaurant}">`

            //save rating
            document.getElementById('rate-form').addEventListener('submit', e => {
                e.preventDefault();

                //get values for each ingredient
                let ratingFries = document.getElementById('range-fries').value;
                let ratingMeat = document.getElementById('range-meat').value;
                let ratingToppings = document.getElementById('range-toppings').value;

                //correct the values to a point out of 5
                ratingFries = parseInt(ratingFries) / 2;
                ratingMeat = parseInt(ratingMeat) / 2;
                ratingToppings = parseInt(ratingToppings) / 2;

                let allRatings = [];

                //save already existing ratings
                kapsalonInfo.ratings.forEach(e => {
                    allRatings.push(e);
                })

                //create new rating format
                let newRating = {
                    "fries": ratingFries,
                    "meat": ratingMeat,
                    "toppings": ratingToppings
                }

                //add new rating to all other ratings
                allRatings.push(newRating);

                //calculate the latest overall rating, so it shows up correctly in the list
                let newGeneralRating = calculateGeneralScoreNumber(kapsalonInfo.ratings);

                //if this new rating is the first ever rating, than calculate the total score
                if (newGeneralRating == "no score yet") {
                    newGeneralRating = Math.round(((ratingFries + ratingMeat + ratingToppings) / 3 + Number.EPSILON) * 10) / 10;
                }

                //create object to adjust in the database
                const kap = {
                    "ratings": allRatings,
                    "latestGeneralRating": newGeneralRating
                }

                //save the new rating
                fetch(`https://web2-kapsamazing-driesv.herokuapp.com/rateKapsalon/${localStorage.kapsalonId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(kap)
                    })
                    .then(res => {
                        res.json()
                    })
                    .then(data => {
                        if (data == undefined) {
                            alert("Thank you for your rating! Kapsalon-lovers will thank you!");
                            window.location.href = './index.html';
                        }
                    });

            })

        }

        //if sliders change, calculate the general score of the rating
        if (document.getElementById('rate-form')) {
            document.getElementById('rate-form').addEventListener('change', e => {
                document.getElementById('rate-overall-score').innerHTML = updateGeneralRating();
            });
        }
    }

    async function loadKapsalonsAdmin() {
        if (sessionStorage.admin == "true") {
            document.getElementById('login-admin').style.display = "none";
            document.getElementById('add-and-datalist').style.display = "flex";
        }

        let kapsalonList = [];

        //fetch all kapsalons
        await fetch('https://web2-kapsamazing-driesv.herokuapp.com/kapsalons')
            .then(response => {
                return response.json();
            })
            .then(data => {
                kapsalonList = data;
                renderKapsalonsAdmin(kapsalonList);
            })

        if (document.getElementById('add-kapsalon-form')) {
            let addForm = document.getElementById('add-kapsalon-form');
            addForm.addEventListener('submit', e => {
                e.preventDefault();

                //if new kapsalon is submitted, get all values
                let newKapid = document.getElementById('kapsalon-kapid').value;
                let newName = document.getElementById('kapsalon-name').value;
                let newRestaurant = document.getElementById('kapsalon-restaurant').value;
                let newCity = document.getElementById('kapsalon-city').value;
                let newPrice = document.getElementById('kapsalon-price').value;
                let newType = document.getElementById('kapsalon-type').value;
                let newDelivered = document.getElementById('kapsalon-delivered').value;
                let newImage = document.getElementById('kapsalon-image').value;
                let newLink = document.getElementById('kapsalon-link').value;
                let newLatitude = document.getElementById('kapsalon-latitude').value;
                let newLongitude = document.getElementById('kapsalon-longitude').value;

                let deliveredOptions = [];

                //create correct values for delivered options, so it works with the database
                if (newDelivered == "pickup-and-delivery") {
                    deliveredOptions.push("pickup");
                    deliveredOptions.push("delivery")
                } else if (newDelivered == "pickup") {
                    deliveredOptions.push("pickup");
                } else if (newDelivered == "delivery") {
                    deliveredOptions.push("delivery");
                }

                //create correct object to save in the database
                const kap = {
                    kapid: newKapid,
                    name: newName,
                    city: newCity,
                    restaurant: newRestaurant,
                    type: newType,
                    delivered: deliveredOptions,
                    price: parseFloat(newPrice),
                    ratings: [],
                    latitude: parseFloat(newLatitude),
                    longitude: parseFloat(newLongitude),
                    latestGeneralRating: 3,
                    image: newImage,
                    link: newLink
                }

                //fetch the new kapsalon to the database
                fetch("https://web2-kapsamazing-driesv.herokuapp.com/saveKapsalon", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(kap)
                    })
                    .then(res => {
                        res.json()
                    })
                    .then(data => {
                        alert("Kapsalon succesful added!");
                        location.reload();
                    })
                    .catch(error => {
                        alert("Something went wrong, code may exist already", error);
                    });
            });
        }
    }

    async function loginAdmin() {
        if (sessionStorage.admin == "true") {
            document.getElementById('login-admin').style.display = "none";
            document.getElementById('add-and-datalist').style.display = "flex";
        } else {
            document.getElementById('register-form').addEventListener('change', e => {
                e.preventDefault();
                if (document.getElementById('show-password').checked) {
                    document.getElementById('login-password').type = "text";
                } else {
                    document.getElementById('login-password').type = "password";
                }
            });

            document.getElementById('register-form').addEventListener('submit', e => {
                e.preventDefault();

                let email = document.getElementById('login-email').value;
                let password = document.getElementById('login-password').value;

                fetch("https://web2-kapsamazing-driesv.herokuapp.com/loginAdmin", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    })
                    .then(res => {
                        return res.json()
                    })
                    .then(data => {
                        if (data.login == true) {
                            document.getElementById('login-admin').style.display = "none";
                            document.getElementById('add-and-datalist').style.display = "flex";
                            sessionStorage.setItem("admin", "true");
                        }
                    })
                    .catch(error => {
                        alert("Something went wrong, email or password is not correct", error);
                    });
            });
        }
    }
}

//function to render all kapsalons in a format like on the homepage
function renderKapsalonList(kapsalonList) {
    let kapsalonListHomepageHTML = "";
    kapsalonList.forEach(e => {
        kapsalonListHomepageHTML += `
            <a class="kapsalon-article-a" href="./kapsalon-info.html">
            <article class="datalist-kapsalon-article" id="${e._id}">
                <figure class="kapsalon-article-figure">
                    <img class="kapsalon-article-img" src="${e.image}" alt="kapsalon from ${e.restaurant}">
                </figure>
                <div class="kapsalon-article-info">
                    <h4 class="kapsalon-article-title">${e.name}</h4>
                    <div class="kapsalon-article-restaurant">
                        <span class="icon-location edit-location-icon"></span>
                        <div class="kapsalon-article-restaurant-name">${e.restaurant}</div>
                        <div class="kapsalon-article-restaurant-distance">${e.city}</div>
                    </div>
                </div>
                <div class="kapsalon-article-moreinfo">
                    <div class="kapsalon-article-rating">
                        <div class="kapsalon-article-rating-number">${calculateGeneralScore(e.ratings)}
                    </div>
                    <div class="kapsalon-article-price">€${e.price}</div>
                </div>
            </article>
        </a>
            `
    });

    //check if there are kapsalons available, otherwise create notification
    if (document.getElementById('kapsalon-datalist')) {
        if (kapsalonListHomepageHTML == "") {
            kapsalonListHomepageHTML = `<div class="no-kapsalons-message">No kapsalons found with your filters.</div>`;
        }

        //when clicked on a kapsalon, get _id and save it in localstorage
        document.getElementById('kapsalon-datalist').innerHTML = kapsalonListHomepageHTML;
        document.getElementById('kapsalon-datalist').addEventListener('click', e => {

            const kapsalonId = e.target.closest('.datalist-kapsalon-article').id;

            if (kapsalonId) {
                localStorage.setItem("kapsalonId", kapsalonId);
            }
        })
    }
}

//function to render all kapsalons in a format like on the adminpage
function renderKapsalonsAdmin(kapsalonList) {
    let kapsalonListAdminHTML = "";
    kapsalonList.forEach(e => {
        kapsalonListAdminHTML += `
        <article class="datalist-kapsalon-article" id="${e._id}">
        <figure class="kapsalon-article-figure">
            <img class="kapsalon-article-img" src="${e.image}" alt="kapsalon from ${e.restaurant}">
        </figure>
        <div class="kapsalon-article-info-admin">
            <h4 class="kapsalon-article-title">${e.name}</h4>
            <div class="kapsalon-article-restaurant">
                <span class="icon-location edit-location-icon"></span>
                <div class="kapsalon-article-restaurant-name">${e.restaurant}</div>
                <div class="kapsalon-article-restaurant-price">€${e.price}</div>
                <div class="kapsalon-article-restaurant-id">code: ${e.kapid}</div>
            </div>
        </div>
        <div class="kapsalon-article-edit">
            <span class="icon-bin"></span>
            <span class="icon-pencil"></span>
        </div>
    </article>
            `
    });

    //check if there are kapsalons available, otherwise create notification
    if (document.getElementById('kapsalon-admin-list')) {
        if (kapsalonListAdminHTML == "") {
            kapsalonListHomepageHTML = `<div class="no-kapsalons-message">No kapsalons added yet.</div>`
        }

        //when clicked on a kapsalon trash icon, get _id and execute delete kapsalon function
        document.getElementById('kapsalon-admin-list').innerHTML = kapsalonListAdminHTML;
        document.getElementById('kapsalon-admin-list').addEventListener('click', e => {

            const kapsalonId = e.target.closest('.datalist-kapsalon-article').id;

            if (kapsalonId) {
                if (e.target.className == "icon-bin") {
                    deleteKapsalon(kapsalonId);
                }
            }
        })
    }
}

//function to delete kapsalon
function deleteKapsalon(kapsalonId) {

    //fetch the deleted kapsalon
    fetch(`https://web2-kapsamazing-driesv.herokuapp.com/deleteKapsalon/${kapsalonId}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            return response.json()
        })
        .then(data => {
            if (data) {
                location.reload();
            }
        })
}

//function to filter all kapsalons on location or restaurant
function updateLocation(kapsalonList) {
    let newList = [];

    //get input value
    let city = document.getElementById('search-location-input').value;

    //make first character of inputed value capital
    city = city.charAt(0).toUpperCase() + city.slice(1);
    //Source: https://flexiple.com/javascript-capitalize-first-letter/

    //check all kapsalons if value is used
    kapsalonList.forEach(e => {
        if (e.city.includes(city) || e.restaurant.includes(`${city}`)) {
            newList.push(e);
        }
    })

    updateList(newList);
}

//function to update all kapsalon list based on filter by type and delivered options
function updateList(kapsalonList) {
    let newList = [];

    //Source: https://stackoverflow.com/questions/48315428/how-to-make-a-filter-in-javascript-which-filters-div-by-checkboxes/48316156
    let kapsalons = document.querySelectorAll("#filter-type-form input[type='checkbox']");
    let options = document.querySelectorAll("#filter-options-form input[type='checkbox']");
    let orderBy = document.getElementById('order-by-input').value;

    //check each checkbox if checked, than push all relevant kapsalons to new list
    kapsalons.forEach(e => {
        if (e.checked == true) {
            kapsalonList.forEach(el => {
                if (e.name == el.type) {
                    newList.push(el);
                }
            })
        }
    })

    let finalList = []; //i know, these lists are not named well

    //check for each delivered option, if checkboxes are checked and push relevant kapsalons to final list
    if (options[0].checked == true && options[1].checked == true) {
        newList.forEach(e => {
            if (e.delivered.includes("pickup") || e.delivered.includes("delivery")) {
                finalList.push(e);
            }
        })
    } else if (options[0].checked == true) {
        newList.forEach(e => {
            if (e.delivered.includes("pickup")) {
                finalList.push(e);
            }
        })
    } else if (options[1].checked == true) {
        newList.forEach(e => {
            if (e.delivered.includes("delivery")) {
                finalList.push(e);
            }
        })
    } else {
        //if nothing is selected, all kapsalons will be shown
        finalList = newList;
    }

    //check other filter possibilities
    sortKapsalons(finalList, orderBy)
    renderKapsalonList(finalList);
}

//function to sort kapsalons by price or rating
function sortKapsalons(kapsalonList, orderBy) {

    if (orderBy == "rating") {
        kapsalonList.sort((a, b) => {
            return b["latestGeneralRating"] - a["latestGeneralRating"];
        })
    } else {
        kapsalonList.sort((a, b) => {
            return a["price"] - b["price"];
        })
    }
}

//function to filter all other kapsalons of the restaurant of the selected kapsalon
function filterKapsalonsRestaurant(kapsalonList, restaurant, city, currentKapsalon) {
    let newList = [];
    kapsalonList.forEach(e => {
        //check both restaurant and city to prevent same named restaurants
        if (e.restaurant == restaurant && e.city == city && e._id != currentKapsalon) {
            newList.push(e);
        }
    })
    renderCommonRestaurant(newList);
}

//function to render kapsalons of the same restaurant
function renderCommonRestaurant(kapsalonList) {
    let kapsalonListCommonHTML = "";
    kapsalonList.forEach(e => {
        kapsalonListCommonHTML += `
        <a class="kapsalon-article-a" href="#">
            <article class="datalist-kapsalon-article" id="${e._id}">
                <figure class="kapsalon-article-figure">
                    <img class="kapsalon-article-img" src="${e.image}" alt="kapsalon from ${e.restaurant}">
                </figure>
                <div class="kapsalon-article-info">
                    <h4 class="kapsalon-article-title">${e.name}</h4>
                    <div class="kapsalon-article-restaurant">
                        <span class="icon-location edit-location-icon"></span>
                        <div class="kapsalon-article-restaurant-name">${e.restaurant}</div>
                        <div class="kapsalon-article-restaurant-distance">${e.city}</div>
                    </div>
                </div>
                <div class="kapsalon-article-moreinfo">
                    <div class="kapsalon-article-rating">
                        <div class="kapsalon-article-rating-number">${calculateGeneralScore(e.ratings)}
                    </div>
                    <div class="kapsalon-article-price">€${e.price}</div>
                </div>
            </article>
        </a>
            `
    });

    //check if there are kapsalons available, otherwise create notification
    if (document.getElementById('other-meals-datalist')) {
        if (kapsalonListCommonHTML == "") {
            kapsalonListHomepageHTML = `<div class="no-kapsalons-message">No other kapsalons found.</div>`
        }

        //when clicked on a kapsalon, get _id and save it in localstorage
        document.getElementById('other-meals-datalist').innerHTML = kapsalonListCommonHTML;
        document.getElementById('other-meals-datalist').addEventListener('click', e => {

            const kapsalonId = e.target.closest('.datalist-kapsalon-article').id;

            if (kapsalonId) {
                localStorage.setItem("kapsalonId", kapsalonId);
                location.reload();
            }
        })
    }
}

//function to calculate the general overall score of all existing ratings
function calculateGeneralScore(ratings) {
    if (ratings.length > 0) {

        let generalScore = 0;
        let numberRatings = 0;

        ratings.forEach(e => {
            generalScore += e.fries + e.meat + e.toppings;
            numberRatings += 1;
        })

        generalScore = Math.round((generalScore / (numberRatings * 3) + Number.EPSILON) * 10) / 10;

        return `${generalScore}/5 <div class="lightbrown">(${numberRatings})</div></div>${calculateStars(generalScore)}`;
        //Source: https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary

    } else {

        let stars = "";
        let starEmpty = `<span class="icon-star-empty edit-star-icon"></span>`;

        for (let i = 0; i < 5; i++) {
            stars += `${starEmpty}`;
        }
        return `no score yet </div>${stars}`;
    }
}

//function to calculate how many stars must be shown
function calculateStars(score) {
    let stars = "";
    let starEmpty = `<span class="icon-star-empty edit-star-icon"></span>`;
    let starFull = `<span class="icon-star-full edit-star-icon"></span>`;

    if (score > 4.5) {
        for (let i = 0; i < 5; i++) {
            stars += `${starFull}`;
        }
    } else if (score > 3.5) {
        for (let i = 0; i < 4; i++) {
            stars += `${starFull}`;
        }
        stars += `${starEmpty}`;
    } else if (score > 2.5) {
        for (let i = 0; i < 3; i++) {
            stars += `${starFull}`;
        }
        for (let i = 0; i < 2; i++) {
            stars += `${starEmpty}`;
        }
    } else if (score > 1.5) {
        for (let i = 0; i < 2; i++) {
            stars += `${starFull}`;
        }
        for (let i = 0; i < 3; i++) {
            stars += `${starEmpty}`;
        }
    } else if (score > 0.5) {
        for (let i = 0; i < 1; i++) {
            stars += `${starFull}`;
        }
        for (let i = 0; i < 4; i++) {
            stars += `${starEmpty}`;
        }
    } else {
        for (let i = 0; i < 5; i++) {
            stars += `${starEmpty}`;
        }
    }
    return stars;
}

//function to calculate the latest general overall rating
function calculateGeneralScoreNumber(ratings) {
    if (ratings.length > 0) {

        let generalScore = 0;
        let numberRatings = 0;

        ratings.forEach(e => {
            generalScore += e.fries + e.meat + e.toppings;
            numberRatings += 1;
        })

        generalScore = Math.round((generalScore / (numberRatings * 3) + Number.EPSILON) * 10) / 10;

        return generalScore;
        //Source: https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary

    } else {
        return `no score yet`;
    }
}

//function to calculate the average score of each ingredient
function calculateIngredientScore(ingredient, ratings) {
    if (ratings.length > 0) {
        let ingredientScore = 0;
        let numberRatings = 0;
        ratings.forEach(e => {
            if (ingredient == "fries") {
                ingredientScore += e.fries;
            } else if (ingredient == "meat") {
                ingredientScore += e.meat;
            } else {
                ingredientScore += e.toppings;
            }
            numberRatings += 1;
        })

        return `${Math.round((ingredientScore / numberRatings + Number.EPSILON) * 10) / 10}/5`
    } else {
        return `?/5`
    }
}

//function to update general rating of ratepage when changing the sliders
function updateGeneralRating() {
    let ratingFries = document.getElementById('range-fries').value;
    let ratingMeat = document.getElementById('range-meat').value;
    let ratingToppings = document.getElementById('range-toppings').value;

    let generalRating = 0;
    generalRating = parseInt(ratingFries) + parseInt(ratingMeat) + parseInt(ratingToppings);

    return `${Math.round((generalRating / 6 + Number.EPSILON) * 10) / 10}/5`;
}

//function to correctly show the location of the restaurant and add a label
function showLocation(kapsalonInfo) {
    //Source: https://docs.mapbox.com/help/tutorials/custom-markers-gl-js/
    mapboxgl.accessToken =
        'pk.eyJ1IjoiZHJpZXN2YW5taWVybG8iLCJhIjoiY2t4YWRyMHprMHRsdjMwbzFuYnhyYTJoYiJ9.g5b9eLexlxz1LMfwgJnTMA';

    const geojson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [kapsalonInfo.longitude, kapsalonInfo.latitude]
            },
            'properties': {
                'title': `${kapsalonInfo.restaurant}`,
                'description': `${kapsalonInfo.city}`
            }
        }]
    };

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/driesvanmierlo/ckxad43w3bkwr14pczh7w3g0x',
        center: [kapsalonInfo.longitude, kapsalonInfo.latitude],
        zoom: 16
    });

    for (const feature of geojson.features) {
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .setPopup(
                new mapboxgl.Popup({
                    offset: 25
                })
                .setHTML(
                    `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
                )
            )
            .addTo(map);
    }
}