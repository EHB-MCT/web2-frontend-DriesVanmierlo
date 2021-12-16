window.onload = async function () {

    console.log("Loaded")

    await loadKapsalonsHomepage();

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
                            <div class="kapsalon-article-rating-number">4,4/5</div>
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

        document.getElementById('kapsalon-datalist').innerHTML = kapsalonListHomepageHTML;
    }
}