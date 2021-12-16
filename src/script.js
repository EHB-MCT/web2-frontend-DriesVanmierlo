window.onload = async function () {

    console.log("Loaded")

    await loadKapsalonsHomepage();
    await loadKapsalonInfo();

    async function loadKapsalonsHomepage() {

        let kapsalonList = [];
        let kapsalonListHomepageHTML;

        await fetch('https://web2-kapsamazing-driesv.herokuapp.com/kapsalons')
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log(data);
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
                            <div class="kapsalon-article-rating-number">${calculateGeneralScore(e.ratings)}</div>
                            <span class="icon-star-full edit-star-icon"></span>
                            <span class="icon-star-full edit-star-icon"></span>
                            <span class="icon-star-full edit-star-icon"></span>
                            <span class="icon-star-full edit-star-icon"></span>
                            <span class="icon-star-empty edit-star-icon"></span>
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
        console.log("LOAD ONE KAPSALON");

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
                        <div class="kapsalon-article-rating-number">4,4/5</div>
                        <span class="icon-star-full edit-star-icon"></span>
                        <span class="icon-star-full edit-star-icon"></span>
                        <span class="icon-star-full edit-star-icon"></span>
                        <span class="icon-star-full edit-star-icon"></span>
                        <span class="icon-star-half edit-star-icon"></span>
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
                            <div>4,8/5</div>
                            <div>4,4/5</div>
                            <div>4,0/5</div>
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
}

function calculateGeneralScore(ratings) {
    if (ratings.length > 0) {

        let generalScore = 0;
        let numberRatings = 0;

        ratings.forEach(e => {
            generalScore += e.fries + e.meat + e.toppings;
            numberRatings += 1;
        })

        return `${Math.round((generalScore / (numberRatings * 3) + Number.EPSILON) * 10) / 10}/5 <div class="lightbrown">(${numberRatings})</div>`;
        //Source: https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary

    } else {
        return `No score yet`;
    }
}