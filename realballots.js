var index = []
var divsel, boothsel, batchsel, papersel, randombut

var queryParams = new URLSearchParams(window.location.search);

function load_divisions(andthen = "") {
    divsel.innerHTML = "";

    const divload = document.createElement("option");

    divload.setAttribute("value", "");
    if (!andthen) {
        divload.setAttribute("selected", "");
    }
    divload.setAttribute("hidden", "");
    divload.innerHTML = "Division";

    divsel.append(divload);

    for (const div in index[1]) {
        nextdiv = document.createElement("option");
        if (andthen == div) {
            nextdiv.setAttribute("selected", "");
        }
        nextdiv.innerHTML = div;

        divsel.append(nextdiv);
    }

    if (!divsel.value) {
        queryParams.delete("division");
        queryParams.delete("booth");
        queryParams.delete("batch");
        queryParams.delete("paper");

        if (history.replaceState) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?${queryParams.toString()}`;
            window.history.replaceState({ path: newurl }, '', newurl);
        }
    }

    load_booths(andthen ? queryParams.get("booth") : "");
}

function load_booths(andthen = "") {
    boothsel.disabled = true;
    boothsel.innerHTML = "";
    if (divsel.value) {
        boothsel.innerHTML = "";

        const divload = document.createElement("option");

        divload.setAttribute("value", "");
        if (!andthen) {
            divload.setAttribute("selected", "");
        }
        divload.setAttribute("hidden", "");
        divload.innerHTML = "Booth";

        boothsel.append(divload);

        for (const div in index[1][divsel.value]) {
            nextdiv = document.createElement("option");
            if (andthen == div) {
                nextdiv.setAttribute("selected", "");
            }
            nextdiv.innerHTML = `${index[0][div]} [${div}]`;
            nextdiv.value = div;

            boothsel.append(nextdiv);
        }

        boothsel.disabled = false;

        if (!boothsel.value) {
            queryParams.delete("booth");
            queryParams.delete("batch");
            queryParams.delete("paper");

            if (history.replaceState) {
                var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?${queryParams.toString()}`;
                window.history.replaceState({ path: newurl }, '', newurl);
            }
        }
    }

    load_batches(andthen ? queryParams.get("batch") : "");
}

function load_batches(andthen = "") {
    batchsel.disabled = true;
    batchsel.innerHTML = "";
    if (boothsel.value) {
        batchsel.innerHTML = "";

        const divload = document.createElement("option");

        divload.setAttribute("value", "");
        if (!andthen) {
            divload.setAttribute("selected", "");
        }
        divload.setAttribute("hidden", "");
        divload.innerHTML = "Batch No.";

        batchsel.append(divload);

        for (const div in index[1][divsel.value][boothsel.value]) {
            nextdiv = document.createElement("option");
            if (andthen == div) {
                nextdiv.setAttribute("selected", "");
            }
            nextdiv.innerHTML = div;
            nextdiv.value = div;

            batchsel.append(nextdiv);
        }

        batchsel.disabled = false;

        if (!batchsel.value) {
            queryParams.delete("batch");
            queryParams.delete("paper");

            if (history.replaceState) {
                var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?${queryParams.toString()}`;
                window.history.replaceState({ path: newurl }, '', newurl);
            }
        }
    }

    load_papers(andthen ? queryParams.get("paper") : "");
}

async function load_papers(andthen = "") {
    papersel.disabled = true;
    papersel.innerHTML = "";
    if (batchsel.value) {
        papersel.innerHTML = "";

        const divload = document.createElement("option");

        divload.setAttribute("value", "");
        if (!andthen) {
            divload.setAttribute("selected", "");
        }
        divload.setAttribute("hidden", "");
        divload.innerHTML = "Paper No.";

        papersel.append(divload);

        if (typeof (index[1][divsel.value][boothsel.value][batchsel.value]) == "number") {
            const requestURL = `${divsel.value}-${boothsel.value}.csv`;
            const request = new Request(requestURL);

            const response = await fetch(request);
            
            for (const batch in index[1][divsel.value][boothsel.value]) {
                index[1][divsel.value][boothsel.value][batch] = {}
            }

            const lines = (await response.text()).split("\n")

            for (const line of lines.slice(1,-1)) {
                const [nbatch, npaper, ...nvote] = line.split(",")

                index[1][divsel.value][boothsel.value][nbatch][npaper] = nvote
            }
        }

        for (const div in index[1][divsel.value][boothsel.value][batchsel.value]) {
            nextdiv = document.createElement("option");
            if (andthen == div) {
                nextdiv.setAttribute("selected", "");
            }
            nextdiv.innerHTML = div;
            nextdiv.value = div;

            papersel.append(nextdiv);
        }

        if (!papersel.value) {
            queryParams.delete("paper");

            if (history.replaceState) {
                var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?${queryParams.toString()}`;
                window.history.replaceState({ path: newurl }, '', newurl);
            }
        }

        papersel.disabled = false;
    }

    load_paper();
}

function load_paper() {
    document.querySelectorAll(".box").forEach((box) => {
        box.innerHTML = ""
    })

    if (papersel.value) {
        Array.from(document.querySelectorAll("header .box")).concat(Array.from(document.querySelectorAll("footer .box"))).forEach((box, i) => {
            box.innerHTML = index[1][divsel.value][boothsel.value][batchsel.value][papersel.value][i]
        })

        queryParams.set("division", divsel.value);
        queryParams.set("booth", boothsel.value);
        queryParams.set("batch", batchsel.value);
        queryParams.set("paper", papersel.value);

        if (history.replaceState) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?${queryParams.toString()}`;
            window.history.replaceState({ path: newurl }, '', newurl);
        }
    }
}

function* degauss(n) {

    let size = 0

    for (i = 1; n > 0; i++) {
        if (n % 2) {
            yield i
        }

        n >>>= 1
    }

    return size
}

function random_paper() {
    randombut.disabled = true;

    const divs = Object.keys(index[1]);
    let sizes = {};

    for (const div of divs) {
        sizes[div] = 0
        for (const booth in index[1][div]) {
            for (const batch in index[1][div][booth]) {
                if (typeof(index[1][div][booth][batch]) == "number") {
                    sizes[div] += Array.from(degauss(index[1][div][booth][batch])).length
                } else {
                    sizes[div] += Object.keys(index[1][div][booth][batch]).length
                }
            }
        }
    }

    let size = Object.values(sizes).reduce((a, b) => a + b, 0)

    let nextlevel = Math.floor(Math.random() * size);

    let selecteddiv = "";

    for (const div of divs) {
        if (nextlevel <= sizes[div]) {
            selecteddiv = div;
            break;
        }

        nextlevel -= sizes[div];
    }

    const booths = Object.keys(index[1][selecteddiv]);
    sizes = {};

    for (const booth of booths) {
        sizes[booth] = 0
        for (const batch in index[1][selecteddiv][booth]) {
            if (typeof (index[1][selecteddiv][booth][batch]) == "number") {
                sizes[booth] += Array.from(degauss(index[1][selecteddiv][booth][batch])).length
            } else {
                sizes[booth] += Object.keys(index[1][selecteddiv][booth][batch]).length
            }
        }
    }

    let selectedbooth = "";

    for (const booth of booths) {
        if (nextlevel <= sizes[booth]) {
            selectedbooth = booth;
            break;
        }

        nextlevel -= sizes[booth];
    }

    const batches = Object.keys(index[1][selecteddiv][selectedbooth]);
    sizes = {};

    for (const batch of batches) {
        sizes[batch] = 0
        if (typeof (index[1][selecteddiv][selectedbooth][batch]) == "number") {
            sizes[batch] += Array.from(degauss(index[1][selecteddiv][selectedbooth][batch])).length
        } else {
            sizes[batch] += Object.keys(index[1][selecteddiv][selectedbooth][batch]).length
        }
    }

    let selectedbatch = "";

    for (const batch of batches) {
        if (nextlevel <= sizes[batch]) {
            selectedbatch = batch;
            break;
        }

        nextlevel -= sizes[batch];
    }

    let papers = []

    if (typeof (index[1][selecteddiv][selectedbooth][selectedbatch]) == "number") {
        papers = Array.from(degauss(index[1][selecteddiv][selectedbooth][selectedbatch]))
    } else {
        papers = Object.keys(index[1][selecteddiv][selectedbooth][selectedbatch])
    }

    selectedpaper = papers[nextlevel];

    queryParams.set("division", selecteddiv);
    queryParams.set("booth", selectedbooth);
    queryParams.set("batch", selectedbatch);
    queryParams.set("paper", selectedpaper);

    load_divisions(selecteddiv);

    randombut.disabled = false;
}

async function load_index() {
    const requestURL = "index.json";
    const request = new Request(requestURL);

    const response = await fetch(request);
    index = await response.json();
}

window.addEventListener("load", (event) => {

    divsel = document.getElementById("division")
    boothsel = document.getElementById("booth")
    batchsel = document.getElementById("batch")
    papersel = document.getElementById("paper")
    randombut = document.getElementById("random")

    load_index().then((v) => {
        load_divisions(queryParams.get("division"));

        divsel.onchange = load_booths;
        boothsel.onchange = load_batches;
        batchsel.onchange = load_papers;
        papersel.onchange = load_paper;
        randombut.onclick = random_paper;
    })
})