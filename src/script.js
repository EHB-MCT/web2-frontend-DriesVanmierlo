let kapsalonsList;

window.onload = async function () {
    console.log("Loaded")
    await loadKapsalonsHomepage();

    async function loadKapsalonsHomepage() {
        console.log("start data fetch")
        await fetch('https://web2-kapsamazing-driesv.herokuapp.com/kapsalons')
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log(data);
            })
    }
}