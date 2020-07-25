/**
 * Fetching JSON data from a website
 * 
 * @param {string} url indicates the address for fetching the data 
 * @returns {object} is data in JSON format
 */
const getJSON = (url) => { 

    return fetch(url)
        .then(function (response) {
            return response.json();
        });
};


/**
 * mapNeighbours arrow function returns neighbours of a country
 * as an associative array (i.e., object) where a key is a country codes and
 * the value is an array containing the neighbour country codes.
 * 
 * @param {object} data is parsed JSON content fetched from the API endpoint https://tie-lukioplus.rd.tuni.fi/corona/api/neighbours
 * @returns {object} nMpa is an object where keys are three-char country codes (alpha3codes), and the values are neighbour country codes as an array.
 */
const mapNeighbours = (data) => {
    const nMap = new Object();
    data.map(item => {
        nMap[item.alpha3Code] = item.borders;
    });
    return nMap;
};

(() => {

    // Countries that have some anomalities in their names (such as special chars, brackets, or multiple variants) are collected here
    const INITIAL_CODES = {
        Brunei: "BRN",
        "Mainland China": "CHN",
        US: "USA",
        Iran: "IRN",
        "South Korea": "KOR",
        "Korea, South": "KOR",
        Korea: "KOR",
        "Taiwan*": "TWN",
        UK: "GBR",
        "United Kingdom": "GBR",
        Czechia: "CZE",
        Russia: "RUS",
        "United Arab Emirates": "UAE",
        Macau: "MAC",
        "North Macedonia": "MKD",
        Venezuela: "VEN",
        Vietnam: "VNM",
        "Cote d'Ivoire": "CIV",
        "West Bank and Gaza": "PSE",
        Kosovo: "KOS",
        "Congo (Kinshasa)": "COD",
        "Congo (Brazzaville)": "COG",
        Tanzania: "TZA",
        Burma: "MMR",
        Syria: "SYR",
        Laos: "LAO",
        Eswatini: "SWZ",
    };

    //Default color for the map
    const DEFAULT_FILL = "#d3d3d3";

    /*
    *Getting the JSON data from a website and putting them into Objects
    */
    let codeMap, caseMap, dateMap, neighbourMap;
    (async () => {
        /*const countries = await getJSON("https://tie-lukioplus.rd.tuni.fi/corona/api/countries");*/
        const countries = await getJSON("https://raw.githubusercontent.com/A-Aapro/Korona/master/lib/countries.json");
        codeMap = countryCodeMap(countries, INITIAL_CODES);
        fillDataList(codeMap);

        /*const caseUrl = `${config.baseURL}corona`;*/
        const caseUrl = "https://raw.githubusercontent.com/A-Aapro/Korona/master/lib/corona.json"
        const cases = await getJSON(caseUrl);
        //const cases = await getJSON('https://tie-lukioplus.rd.tuni.fi/corona/api/corona/');
        caseMap = mapCasesWithCountrycodes(cases, codeMap);

        /*const data = await getJSON("https://tie-lukioplus.rd.tuni.fi/corona/api/neighbours");*/
        const data = await getJSON("https://raw.githubusercontent.com/A-Aapro/Korona/master/lib/neighbours.json");
        neighbourMap = mapNeighbours(data);
        colorWorld(caseMap);

        /*const dateData = await getJSON("https://tie-lukioplus.rd.tuni.fi/corona/api/corona/timeseries/");*/
        const dateData = await getJSON("https://raw.githubusercontent.com/A-Aapro/Korona/master/lib/timeseries.json");
        dateMap = mapTimeseries(dateData);
        document.getElementById("country").addEventListener("input", inputHandler);
        document.getElementById("countryform").addEventListener("submit", (e) => e.preventDefault());
    })();

    const tableSelection = new Array();

    /**
     * Selecting a country from the menu
     * 
     * @param {object} e is an event object for the function
     * @returns {undefined} value
     *
     */
    function inputHandler(e) {
        stopHandler();
        e.preventDefault();
        const selectedCountry = document.getElementById("country").value;
        selectCountry(selectedCountry);
    }

    function selectCountry(selectedCountry) {
        if (!Object.prototype.hasOwnProperty.call(codeMap, selectedCountry)) {
            return;
        } else {
            if (containsCountry(tableSelection, selectedCountry)) {
                const element = document.querySelector("tbody");
                element.innerHTML = "";
                rearrangeTable(selectedCountry, tableSelection);
            } else {
                tableSelection.push(selectedCountry);
                rewriteTable(selectedCountry);
                return;
            }
        }
    }

    /**
     * Checks if given country array contains a certain country
     * 
     * @param {Array} array includes a list of country names
     * @param {string} value is name of the country
     * @returns {boolean} boolean value that is true or false depending if the country name is found or not
     */
    function containsCountry(array, value) {
        for (let i = 0; i < array.length; i++) {
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    }

    /**
     * Rearranging the table
     * if a country has been selected again then it will be moved to the first cell of the table
     * 
     * @param {string} latestCountry is the name of the country that needs to be moved on the table
     * @param {Array} array is a list of country names
     */
    function rearrangeTable(latestCountry, array) {

        const index = array.indexOf(latestCountry);
        array.splice(index, 1);
        array.sort();
        array.unshift(latestCountry);

        for (let i = array.length - 1; i >= 0; i--) {
            rewriteTable(array[i]);
        }
    }

    /**
     * Rewriting the table
     * 
     * @param {string} countryName is name that is used in rewriting the table
     */
    function rewriteTable(countryName) {
        const code = codeMap[countryName];
        const element = document.querySelector("tbody");
        element.insertAdjacentHTML("afterbegin", constructTableRow(code));
        document.getElementById("country").value = null;
        fillNeighbours(code);
    }

    document.getElementById("sort").addEventListener("click", function () { sortTable(event) }, false);


    function sortTable() {
        stopHandler();
        var col = window.event.target.id;

        let r = -1;
        if (col == "n0") {
            r = 0;
        }
        if (col == "n1") {
            r = 1;
        }
        if (col == "n2") {
            r = 2;
        }
        if (col == "n3") {
            r = 3;
        }
        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.getElementById("stats");
        switching = true;
        dir = "asc";

        while (switching) {

            switching = false;
            rows = table.rows;

            for (i = 1; i < (rows.length - 1); i++) {
                // Start by saying there should be no switching:
                shouldSwitch = false;
                /* Get the two elements you want to compare,
                one from current row and one from the next: */
                x = rows[i].getElementsByTagName("td")[r];
                y = rows[i + 1].getElementsByTagName("td")[r];
                /* Check if the two rows should switch place,
                based on the direction, asc or desc: */
                if (dir == "desc") {

                    if (r == 0) {

                        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                            // If so, mark as a switch and break the loop:
                            shouldSwitch = true;
                            break;
                        }
                    }
                    if (r > 0) {
                        if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
                            // If so, mark as a switch and break the loop:
                            shouldSwitch = true;
                            break;
                        }
                    }
                } else if (dir == "asc") {

                    if (r == 0) {
                        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                            // If so, mark as a switch and break the loop:
                            shouldSwitch = true;
                            break;
                        }
                    }
                    if (r > 0) {
                        if (x.innerHTML != "-" && parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
                            // If so, mark as a switch and break the loop:
                            shouldSwitch = true;
                            break;
                        }
                    }
                }
            }
            if (shouldSwitch) {
                /* If a switch has been marked, make the switch
                and mark that a switch has been done: */
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                // Each time a switch is done, increase this count by 1:
                switchcount++;
            } else {
                /* If no switching has been done AND the direction is "asc",
                set the direction to "desc" and run the while loop again. */
                if (switchcount == 0 && dir == "asc") {
                    dir = "desc";
                    switching = true;
                }
            }
        }
    }
    /**
     * creating an Object with countries and their codes from JSON
     * 
     * @param {object} countries includes country data
     * @param {object} initialCountries is countries with anomalities in their names
     * @returns {object} orderedMap which is the map with all the country codes
     */
    function countryCodeMap(countries, initialCountries) {

        const codeMapTemp = new Object();

        for (let i = 0; i < countries.length; i++) {
            //trim the name of the country:
            const splitList = countries[i].name.split("(");
            const mapKey = splitList[0].trim();
            //fetch the code of the country:
            const mapValue = countries[i].alpha3Code;
            codeMapTemp[mapKey] = mapValue;
        }

        const codeMapNew = Object.assign(codeMapTemp, initialCountries);

        const orderedMap = {};
        Object.keys(codeMapNew).sort().forEach(function (key) {
            orderedMap[key] = codeMapNew[key];

        });

        return orderedMap;
    }

    /** 
     * Fills the data list with options
     * 
     * @param {object} codeMap is the map with all the country codes
     */
    function fillDataList(codeMap) {

        const op = Object.keys(codeMap).reduce((options, key) => {
            options = options + "<option value=\"" + key + "\"></option>";
            return options;
        }, "");
        document.getElementById("searchresults").innerHTML = op;

    }

    /**
     * Creates an object with country codes and corona cases 
     * 
     * @param {object} cases includes corona cases
     * @param {object} codeMap includes map with country codes
     * @returns {object} caseObjectMap that includes map with country codes and corona cases
     */
    function mapCasesWithCountrycodes(cases, codeMap) {

        const caseObjectMap = new Object();
        let objTemp;

        Object.keys(cases).filter(key => key !== "td" || key !== "ts").forEach((key) => {
            if (cases[key].confirmed > 0) {

                let countryName = key.replace(/_/g, " ");
                const splitList = countryName.split("(");
                countryName = splitList[0].trim();

                objTemp = cases[key];

                let countryCode;
                if (Object.prototype.hasOwnProperty.call(codeMap, countryName)) {
                    countryCode = codeMap[countryName];

                    const countryObj = new Object();
                    countryObj.confirmed = objTemp.confirmed;
                    countryObj.deaths = objTemp.deaths;
                    countryObj.recovered = objTemp.recovered;
                    countryObj.country = countryName;
                    caseObjectMap[countryCode] = countryObj;

                }
            }
        });

        return caseObjectMap;
    }

    /**
     * A function for finding country based on the country code.
     * 
     * @param {object} object has country names and country codes
     * @param {string} value is the country code that is used for finding the country name
     * @returns {string|undefined} depending on finding the country name or not
     */
    function getKey(object, value) {
        if (Object.values(object).indexOf(value) > -1) {
            return Object.keys(object).find(key => object[key] === value);
        } else {
            return undefined;
        }
    }

    /**
     * Creating the contents for table
     * 
     * @param {string} code is a country code
     * @returns {string} includes all the necessary information for the table row
     */
    function constructTableRow(code) {
        if (Object.prototype.hasOwnProperty.call(caseMap, code)) {
            if (caseMap[code].confirmed === 0) {
                return "<tr><td>" + getKey(codeMap, code) + "</td><td>-1</td><td>-1</td><td>-1</td></tr>";
            } else {
                return "<tr><td>" + caseMap[code].country + "</td><td>" + caseMap[code].confirmed + "</td><td>" + caseMap[code].deaths + "</td><td>" + caseMap[code].recovered + "</td></tr>";
            }
        } else if (getKey(codeMap, code) === undefined) {
            return "";
        } else {
            return "<tr><td>" + getKey(codeMap, code) + "</td><td>-1</td><td>-1</td><td>-1  </td></tr>";
        }
    }

    //Creating array for different dates and arrays for countries with multiple regions
    const dateArray = {};
    const chinaArray = [];
    const canadaArray = [];

    /**
     * Creating Timeseries. Timeseries goes through the corona situation, showing the world situation one day per second
     * 
     * @param {object} dateData includes data for timeseries
     * @returns {object} dateArray has data about confirmed cases and deaths in every country
     */
    function mapTimeseries(dateData) {

        for (let i = 0; i < dateData[0].confirmed.length; i++) {
            const countryObj = new Object();

            countryObj.confirmed = dateData[0].confirmed[i];
            countryObj.deaths = dateData[1].deaths[i];

            const name = countryObj.confirmed["Country/Region"];
            let countryName = name.replace(/_/g, " ");
            const splitList = countryName.split("(");
            countryName = splitList[0].trim();

            if (Object.prototype.hasOwnProperty.call(codeMap, countryName)) {
                if (countryName === "China") {
                    chinaArray.push(countryObj);
                }
                if (countryName === "Canada") {
                    canadaArray.push(countryObj);
                }
                if (countryName === "France" || countryName === "United Kingdom" || countryName === "Netherlands") {
                    if (countryObj.confirmed["Province/State"] === "") {
                        const code = codeMap[countryName];
                        dateArray[code] = countryObj;
                    }
                }
                else {
                    const code = codeMap[countryName];
                    dateArray[code] = countryObj;
                }
            }

            delete countryObj.confirmed.Lat;
            delete countryObj.confirmed.Long;
            delete countryObj.deaths.Lat;
            delete countryObj.deaths.Long;
            delete countryObj.confirmed["Province/State"];
            delete countryObj.deaths["Province/State"];
            delete countryObj.confirmed["Country/Region"];
            delete countryObj.deaths["Country/Region"];
        }

        //Parsing the smaller regions from China and Canada together
        dateArray["CHN"] = parseCountryRegions(chinaArray);
        dateArray["CAN"] = parseCountryRegions(canadaArray);

        return dateArray;
    }


    let dates = new Object();

    /**
     * helper function for parsing information on special cases (China, Canada)
     * function combines the information from different provincies
     * 
     * @param {Array} countryarray has information on special case country
     * 
     * @returns {object} countryObj includes all combined information for the country
     */
    function parseCountryRegions(countryarray) {
        const countryKeys = Object.keys(countryarray[0].confirmed);
        const countryConfirmed = Object.values(countryarray[0].confirmed);
        const countryDeaths = Object.values(countryarray[0].deaths);
        for (let j = 1; j < countryarray.length; j++) {
            const tempConfirmed = Object.values(countryarray[j].confirmed);
            const tempDeaths = Object.values(countryarray[j].deaths);
            for (let k = 0; k < tempConfirmed.length; k++) {
                countryConfirmed[k] = countryConfirmed[k] + tempConfirmed[k];
            }
            for (let l = 0; l < tempConfirmed.length; l++) {
                countryDeaths[l] = countryDeaths[l] + tempDeaths[l];
            }
        }
        const confirmedObj = {};
        const deathsObj = {};
        for (let i = 0; i < countryKeys.length; i++) {
            confirmedObj[countryKeys[i]] = countryConfirmed[i];
            deathsObj[countryKeys[i]] = countryDeaths[i];
        }
        const countryObj = { confirmed: confirmedObj, deaths: deathsObj };
        dates = countryKeys;
        return countryObj;
    }

    let time;

    /**
     * Handels button click that activates timeseries
     */
    document.getElementById("timeseries").addEventListener("click", clickHandler, false);
   /* document.getElementById("stopseries").addEventListener("click", stopHandler, false);*/

    function clickHandler() {
        clearInterval(time);
        let j = 0;
        updateDate(j, dates);
        j++;
        time = window.setInterval(function () {
            updateDate(j, dates);
            j++;
        }, 80);
    }

    /**
     * Updating the date for timeseries
     * 
     * @param {number} i is used for finding information about specific date
     * @param {object} dates includes information for timeseries
     */
    function updateDate(i, dates) {
        if (i === Object.entries(dates).length - 1) {
            clearInterval(time);
        }
        const dateAr = new Object();
        Object.keys(dateMap).forEach((key) => {
            dateAr[key] = { fillColor: getColor(dateMap[key].confirmed[dates[i]], dateMap[key].deaths[dates[i]]) };
        });
        document.getElementById("date").innerHTML = "Date M/D/Y: " + dates[i];
        map.updateChoropleth(dateAr);

    }

    function stopHandler() {
        clearInterval(time);
        document.getElementById("date").innerHTML = "Date M/D/Y: 7/16/20";

    }

    let ar = new Object();

    /**
     * Fill the neighboring countries of a selected country
     * 
     * @param {string} code is a country code
     * @returns {undefined} value
     */
    function fillNeighbours(code) {
        resetMapColors();

        if (Object.prototype.hasOwnProperty.call(neighbourMap, code) && Object.prototype.hasOwnProperty.call(caseMap, code)) {
            neighbourMap[code].forEach((value) => {
                if (caseMap[value] !== undefined) { //joidenkin maiden tilastoissa voi olla puutteita
                    ar[value] = { fillColor: getColor(caseMap[value].confirmed, caseMap[value].deaths) };

                }
            });
            ar[code] = { fillColor: getColor(caseMap[code].confirmed, caseMap[code].deaths) };//lisätään haetun maan väritys
            map.updateChoropleth(ar);
            ar = new Object();
        }

    }

    /**
     * Reseting the map colors
     */
    function resetMapColors() {
        Object.keys(ar).forEach((key) => {
            ar[key] = { fillColor: DEFAULT_FILL };
        });
        map.updateChoropleth(null, { reset: true });
        map.updateChoropleth(ar);
    }


    const map = new Datamap({
        element: document.getElementById("mapcontainer"),
        setProjection: function (element) {
            let w = $("#mapcontainer").width();
            let projection = d3.geo.mercator().center([0, 40]).translate([element.offsetWidth / 2, element.offsetHeight / 2])
                .scale((w / 958) * 120);
            let path = d3.geo.path()
                .projection(projection);

            return { path: path, projection: projection };
        },
        fills: {
            defaultFill: DEFAULT_FILL,
        },
        height: null,
        width: null,
        responsive: true,
        geographyConfig: {
            highlightOnHover: false,
            highlightFillColor: false,
            highlightBorderColor: 'rgba(193, 23, 235, 50)',
            highlightBorderWidth: 2,
            highlightBorderOpacity: 1
        },
        done: function (datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function (geography) {
                let country = geography.properties.name;
                stopHandler();
                selectCountry(country);
            });
        },

    });


    $(window).resize(function () {
        map.resize();
    });


    //creating a Date object to present the current date
    const n = new Date();
    const y = n.getFullYear() - 2000;
    const m = n.getMonth() + 1;
    const d = n.getDate();
    document.getElementById("date").innerHTML = "Date M/D/Y: 7/16/20";

    /**
     * function is used on coloring the world map
     * 
     * @param {object} caseMap includes corona information for every country 
     */
    const colorWorld = (caseMap) => {
        const arra = new Object();
        const countries = Datamap.prototype.worldTopo.objects.world.geometries;

        for (let i = 0, j = countries.length; i < j; i++) {
            const id = countries[i].id;
            if (id !== "-99" && Object.prototype.hasOwnProperty.call(caseMap, id)) {
                if (caseMap[id] !== undefined) {
                    arra[id] = { fillColor: getColor(caseMap[id].confirmed, caseMap[id].deaths) };
                }
            }
        }
        map.updateChoropleth(arra);
    };


    /**
     * Constructs a HSL color based on the given parameters.
     * The darker the color, the more alarming is the situation-
     * Hue gives the tone: blue indicates confirmed (hue 240), red indicates deaths (hue 360).
     * H: hue ranges between blue and red, i.e., 240..360.
     * S: saturation is constant (100)
     * L: lightness as a percentage between 0..100%, 0 dark .. 100 light
     * 
     * @param {string} confirmed The number of confirmed people having coronavirus
     * @param {string} deaths The number of dead people, 20 times more weight than confirmed
     * @returns {number} color HSL color constructed based on confirmed and deaths
     */
    const getColor = (confirmed, deaths) => {
        const denominator = confirmed + deaths === 0 ? 1 : confirmed + deaths;
        const nominator = deaths ? deaths : 0;
        const hue = int(190 + 120 * nominator / denominator);
        const saturation = 100; //constant

        let weight = int(7 * Math.log(confirmed + 20 * deaths));
        weight = weight ? (weight > 100 ? 95 : weight) : 0;

        let lightness = 95 - weight;
        lightness = lightness < 0 ? 0 : lightness;
        return `hsl(${hue}, ${saturation}, ${lightness})`;
    };

    /**
     *  Helper function that parses a string and returns an integer
     * 
     * @param {string} str temporary variable
     * @returns {number} that  is used for contructing a HSL color 
     */
    const int = (str) => Number.parseInt(str);

})();