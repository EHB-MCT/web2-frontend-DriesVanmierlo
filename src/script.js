const stringify = require("fast-json-stable-stringify");
const {
    CompatSource
} = require("webpack-sources");

window.onload = async function () {

    console.log("Loaded")

    await loadKapsalonsHomepage();
    await loadKapsalonInfo();
    await validateCode();
    await rateKapsalon();
    await loadKapsalonsAdmin();

    async function loadKapsalonsHomepage() {

        let kapsalonList = [];

        await fetch('https://web2-kapsamazing-driesv.herokuapp.com/kapsalons')
            .then(response => {
                return response.json();
            })
            .then(data => {
                kapsalonList = data;
                sortKapsalons(kapsalonList, "rating");
                renderKapsalonList(kapsalonList);
            })

        if (document.getElementById('search-location-form')) {
            document.getElementById('search-location-form').addEventListener('submit', e => {
                e.preventDefault();
                console.log("LOCATION!");
                if (document.getElementById('search-location-input').value != "") {
                    updateLocation(kapsalonList);
                }
            })
        }

        if (document.getElementById('filter-type-form')) {
            document.getElementById('filter-type-form').addEventListener('change', e => {
                e.preventDefault();
                console.log("CHANGE!");
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
                console.log("ORDER!")
                updateList(kapsalonList);
            })
        }
    }

    async function loadKapsalonInfo() {

        let kapsalonInfo;

        await fetch(`https://web2-kapsamazing-driesv.herokuapp.com/kapsalon/${localStorage.kapsalonId}`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log(data);
                kapsalonInfo = data;
            })

        if (document.getElementById('kapsalon-info-section')) {
            console.log(kapsalonInfo);
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

            document.getElementById('other-meals-title').innerHTML = `
                Other meals from ${kapsalonInfo.restaurant}
                `;

            fetch('https://web2-kapsamazing-driesv.herokuapp.com/kapsalons')
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    kapsalonList = data;
                    filterKapsalonsRestaurant(kapsalonList, kapsalonInfo.restaurant, kapsalonInfo.city, kapsalonInfo._id);
                    renderKapsalonList(kapsalonList);
                })


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
                console.log(kapid);

                fetch(`https://web2-kapsamazing-driesv.herokuapp.com/kapsalon/?id=${kapid}`)
                    .then(response => {
                        return response.json();
                    })
                    .then(data => {
                        console.log(data);
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

        await fetch(`https://web2-kapsamazing-driesv.herokuapp.com/kapsalon/${localStorage.kapsalonId}`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                kapsalonInfo = data;
            })

        if (document.getElementById('rate-form')) {
            console.log("Start rating");

            document.getElementById("rate-title").innerHTML = `Rate "${kapsalonInfo.name}" from "${kapsalonInfo.restaurant}"`;

            document.getElementById('rate-form').addEventListener('submit', e => {
                e.preventDefault();

                let ratingFries = document.getElementById('range-fries').value;
                let ratingMeat = document.getElementById('range-meat').value;
                let ratingToppings = document.getElementById('range-toppings').value;

                ratingFries = parseInt(ratingFries) / 2;
                ratingMeat = parseInt(ratingMeat) / 2;
                ratingToppings = parseInt(ratingToppings) / 2;

                let allRatings = [];

                kapsalonInfo.ratings.forEach(e => {
                    allRatings.push(e);
                })

                let newRating = {
                    "fries": ratingFries,
                    "meat": ratingMeat,
                    "toppings": ratingToppings
                }

                allRatings.push(newRating);

                let newGeneralRating = calculateGeneralScoreNumber(kapsalonInfo.ratings);
                console.log(newGeneralRating);

                if (newGeneralRating == "no score yet") {
                    newGeneralRating = Math.round(((ratingFries + ratingMeat + ratingToppings) / 3 + Number.EPSILON) * 10) / 10;
                }

                const kap = {
                    "ratings": allRatings,
                    "latestGeneralRating": newGeneralRating
                }

                console.log("kap: ", kap);

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
                        console.log(data);
                        if (data == undefined) {
                            alert("Thank you for your rating! Kapsalon-lovers will thank you!");
                            window.location.href = './index.html';
                        }
                    });

            })

        }

        if (document.getElementById('rate-form')) {
            document.getElementById('rate-form').addEventListener('change', e => {
                console.log("Change");

                document.getElementById('rate-overall-score').innerHTML = updateGeneralRating();
            });
        }
    }

    async function loadKapsalonsAdmin() {
        let kapsalonList = [];

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

                console.log(newDelivered);

                let deliveredOptions = [];

                if (newDelivered == "pickup-and-delivery") {
                    deliveredOptions.push("pickup");
                    deliveredOptions.push("delivery")
                } else if (newDelivered == "pickup") {
                    deliveredOptions.push("pickup");
                } else if (newDelivered == "delivery") {
                    deliveredOptions.push("delivery");
                }

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
                console.log(kap);

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
            })
        }
    }
}

//General functions

function renderKapsalonList(kapsalonList) {
    let kapsalonListHomepageHTML;
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

    if (document.getElementById('kapsalon-datalist')) {
        document.getElementById('kapsalon-datalist').innerHTML = kapsalonListHomepageHTML;
        document.getElementById('kapsalon-datalist').addEventListener('click', e => {
            console.log("click on data list", e);

            const kapsalonId = e.target.closest('.datalist-kapsalon-article').id;
            console.log(kapsalonId, e.target);

            if (kapsalonId) {
                localStorage.setItem("kapsalonId", kapsalonId);
            }
        })
    }
}

function renderKapsalonsAdmin(kapsalonList) {
    let kapsalonListAdminHTML;
    kapsalonList.forEach(e => {
        kapsalonListAdminHTML += `
        <article class="datalist-kapsalon-article" id="${e._id}">
        <figure class="kapsalon-article-figure">
            <img class="kapsalon-article-img" src="${e.image}" alt="kapsalon from ${e.restaurant}">
        </figure>
        <div class="kapsalon-article-info">
            <h4 class="kapsalon-article-title">${e.name}</h4>
            <div class="kapsalon-article-restaurant">
                <span class="icon-location edit-location-icon"></span>
                <div class="kapsalon-article-restaurant-name">${e.restaurant}</div>
                <div class="kapsalon-article-restaurant-distance">€${e.price}</div>
            </div>
        </div>
        <div class="kapsalon-article-edit">
            <span class="icon-bin"></span>
            <span class="icon-pencil"></span>
        </div>
    </article>
            `
    });

    if (document.getElementById('kapsalon-admin-list')) {
        document.getElementById('kapsalon-admin-list').innerHTML = kapsalonListAdminHTML;
        document.getElementById('kapsalon-admin-list').addEventListener('click', e => {
            console.log("click on data list", e);

            const kapsalonId = e.target.closest('.datalist-kapsalon-article').id;
            console.log(kapsalonId, e.target);

            if (kapsalonId) {
                if (e.target.className == "icon-bin") {
                    deleteKapsalon(kapsalonId);
                }
            }
        })
    }
}

function deleteKapsalon(kapsalonId) {
    console.log("delete kapsalon with id:", kapsalonId)

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
            console.log('Challenge succesfully removed:', data);
            if (data) {
                location.reload();
            }
        })
}

function updateLocation(kapsalonList) {
    let newList = [];

    let city = document.getElementById('search-location-input').value;

    city = city.charAt(0).toUpperCase() + city.slice(1);
    //Source: https://flexiple.com/javascript-capitalize-first-letter/

    kapsalonList.forEach(e => {
        if (city == e.city || city == e.restaurant) {
            newList.push(e);
        }
    })

    updateList(newList);
}

function updateList(kapsalonList) {
    let newList = [];

    let kapsalons = document.querySelectorAll("#filter-type-form input[type='checkbox']");
    let orderBy = document.getElementById('order-by-input').value;

    kapsalons.forEach(e => {
        if (e.checked == true) {

            kapsalonList.forEach(el => {
                if (e.name == el.type) {
                    newList.push(el);
                }
            })
        }
    })
    sortKapsalons(newList, orderBy)
    renderKapsalonList(newList);
}

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

function filterKapsalonsRestaurant(kapsalonList, restaurant, city, currentKapsalon) {
    console.log(kapsalonList);
    let newList = [];
    kapsalonList.forEach(e => {
        if (e.restaurant == restaurant && e.city == city && e._id != currentKapsalon) {
            newList.push(e);
        }
    })
    console.log(newList);
    renderCommonRestaurant(newList);
}

function renderCommonRestaurant(kapsalonList) {
    let kapsalonListCommonHTML;
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

    if (document.getElementById('other-meals-datalist')) {
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

function calculateIngredientScore(ingredient, ratings) {
    console.log(ingredient, ratings)
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

function updateGeneralRating() {
    let ratingFries = document.getElementById('range-fries').value;
    let ratingMeat = document.getElementById('range-meat').value;
    let ratingToppings = document.getElementById('range-toppings').value;

    let generalRating = 0;
    generalRating = parseInt(ratingFries) + parseInt(ratingMeat) + parseInt(ratingToppings);

    return `${Math.round((generalRating / 6 + Number.EPSILON) * 10) / 10}/5`;
}

function showLocation(kapsalonInfo) {
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