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

    async function loadKapsalonsHomepage() {

        let kapsalonList = [];
        let kapsalonListHomepageHTML;

        await fetch('https://web2-kapsamazing-driesv.herokuapp.com/kapsalons')
            .then(response => {
                return response.json();
            })
            .then(data => {
                kapsalonList = data;
            })

        kapsalonList.forEach(e => {
            kapsalonListHomepageHTML += `
                <a class="kapsalon-article-a" href="./kapsalon-info.html">
                <article class="datalist-kapsalon-article" id="${e._id}">
                    <figure class="kapsalon-article-figure">
                        <img class="kapsalon-article-img" src="./images/example-kapsalon-1.jpg" alt="">
                    </figure>
                    <div class="kapsalon-article-info">
                        <h4 class="kapsalon-article-title">${e.name}</h4>
                        <div class="kapsalon-article-restaurant">
                            <span class="icon-location edit-location-icon"></span>
                            <div class="kapsalon-article-restaurant-name">${e.restaurant}</div>
                            <div class="kapsalon-article-restaurant-distance">0,7 km</div>
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
                <img class="kapsalon-info-img" src="./images/example-kapsalon-1.jpg" alt="">
            </figure>
            <div id="kapsalon-info-container">
                <div id="kapsalon-info-header">
                    <div id="kapsalon-info-header-text">
                        <h3 id="kapsalon-info-header-title">${kapsalonInfo.name}</h3>
                        <div id="kapsalon-info-header-restaurant">
                            <div id="info-header-restaurant-name">${kapsalonInfo.restaurant}</div>
                            <div id="info-header-restaurant-distance">0,7 km</div>
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
                            <div><span class="icon-star-full edit-star-icon"></span>
                                <span class="icon-star-full edit-star-icon"></span>
                                <span class="icon-star-full edit-star-icon"></span>
                                <span class="icon-star-full edit-star-icon"></span>
                                <span class="icon-star-half edit-star-icon"></span></div>
                            <div><span class="icon-star-full edit-star-icon"></span>
                                <span class="icon-star-full edit-star-icon"></span>
                                <span class="icon-star-full edit-star-icon"></span>
                                <span class="icon-star-full edit-star-icon"></span>
                                <span class="icon-star-half edit-star-icon"></span></div>
                            <div><span class="icon-star-full edit-star-icon"></span>
                                <span class="icon-star-full edit-star-icon"></span>
                                <span class="icon-star-full edit-star-icon"></span>
                                <span class="icon-star-full edit-star-icon"></span>
                                <span class="icon-star-empty edit-star-icon"></span></div>
                        </div>
                    </div>
                </div>
                <div id="kapsalon-info-order">
                    <a href="#">Order</a>
                    <div>€${kapsalonInfo.price}</div>
                </div>
            </div>
                `

            document.getElementById('other-meals-title').innerHTML = `
                Other meals from ${kapsalonInfo.restaurant}
                `
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

                const kap = {
                    "ratings": allRatings
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

        document.getElementById('rate-form').addEventListener('change', e => {
            console.log("Change");

            document.getElementById('rate-overall-score').innerHTML = updateGeneralRating();
        });

    }
}

//General functions

function calculateGeneralScore(ratings) {
    if (ratings.length > 0) {

        let generalScore = 0;
        let numberRatings = 0;

        ratings.forEach(e => {
            generalScore += e.fries + e.meat + e.toppings;
            numberRatings += 1;
        })

        generalScore = Math.round((generalScore / (numberRatings * 3) + Number.EPSILON) * 10) / 10;

        let stars = "";
        let starEmpty = `<span class="icon-star-empty edit-star-icon"></span>`;
        let starHalf = `<span class="icon-star-half edit-star-icon"></span>`;
        let starFull = `<span class="icon-star-full edit-star-icon"></span>`;

        if (generalScore > 4.5) {
            for (let i = 0; i < 5; i++) {
                stars += `${starFull}`;
            }
        } else if (generalScore > 3.5) {
            for (let i = 0; i < 4; i++) {
                stars += `${starFull}`;
            }
            stars += `${starEmpty}`;
        } else if (generalScore > 2.5) {
            for (let i = 0; i < 3; i++) {
                stars += `${starFull}`;
            }
            for (let i = 0; i < 2; i++) {
                stars += `${starEmpty}`;
            }
        } else if (generalScore > 1.5) {
            for (let i = 0; i < 2; i++) {
                stars += `${starFull}`;
            }
            for (let i = 0; i < 3; i++) {
                stars += `${starEmpty}`;
            }
        } else if (generalScore > 0.5) {
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

        return `${generalScore}/5 <div class="lightbrown">(${numberRatings})</div></div>${stars}`;
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