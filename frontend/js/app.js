const searchBtn = document.getElementById("searchBtn");
const playerTag = document.getElementById("playerTag");
const playerData = document.getElementById("playerData");
const brawlerList = document.getElementById("brawlerList");
const battleLog = document.getElementById("battleLog");

const themeToggle = document.getElementById("themeToggle");

const brawlerSearch = document.getElementById("brawlerSearch");
const powerFilter = document.getElementById("powerFilter");
const sortBrawlers = document.getElementById("sortBrawlers");
const resetBrawlers = document.getElementById("resetBrawlers");
const sortDirection = document.getElementById("sortDirection");

const activityHeatmap =
    document.getElementById("activityHeatmap");

let allBrawlers = [];
let showAllBattles = false;
let sortAscending = false;
let topBrawlersChart = null;
let powerLevelChart = null;
let trophyDistributionChart = null;


// ==========================================
// SEARCH PLAYER
// ==========================================

async function getPlayer() {

    const tag = playerTag.value.trim();

    if (tag === "") {

        playerData.innerHTML = `
            <p>Please enter a player tag.</p>
        `;

        return;
    }

    playerData.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading player...</p>
        </div>
    `;

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    try {

        const response = await fetch(
            `http://localhost:5000/api/player/${encodeURIComponent(tag)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        displayPlayer(data);

        allBrawlers = data.brawlers || [];

        displayBrawlers(allBrawlers);

        updatePlayerOverview(data);

        updateBrawlerAnalytics(data);

        updateTopBrawlersChart(data);

        updatePowerLevelChart(data);

        updateTrophyDistributionChart(data);

        showAllBattles = false;

        getBattleLog(tag);

    } catch (error) {

        console.error(error);

        playerData.innerHTML = `
            <div class="error-state">

                <h2>Player Not Found</h2>

                <p>
                    Check the player tag and try again.
                </p>

            </div>
        `;

    } finally {

        searchBtn.disabled = false;
        searchBtn.textContent = "Search";

    }
}


// ==========================================
// DISPLAY PLAYER PROFILE
// ==========================================

function displayPlayer(data) {

    const lastUpdated =
        document.getElementById("lastUpdated");

    if (lastUpdated) {

        lastUpdated.textContent =
            `Last updated: ${new Date().toLocaleString()}`;

    }

    playerData.innerHTML = `

        <h2>${data.name}</h2>

        <div class="profile-grid">

            <div class="stat-card">
                <span>Player Tag</span>
                <strong>${data.tag}</strong>
            </div>

            <div class="stat-card">
                <span>Trophies</span>
                <strong>${data.trophies.toLocaleString()}</strong>
            </div>

            <div class="stat-card">
                <span>Highest Trophies</span>
                <strong>${data.highestTrophies.toLocaleString()}</strong>
            </div>

            <div class="stat-card">
                <span>Experience Level</span>
                <strong>${data.expLevel}</strong>
            </div>

            <div class="stat-card">
                <span>Experience Points</span>
                <strong>${data.expPoints.toLocaleString()}</strong>
            </div>

            <div class="stat-card">
                <span>Club</span>
                <strong>
                    ${data.club ? data.club.name : "No Club"}
                </strong>
            </div>

        </div>

    `;
}


// ==========================================
// PLAYER OVERVIEW
// ==========================================

function updatePlayerOverview(data) {

    const brawlers = data.brawlers || [];

    const totalBrawlers =
        brawlers.length;

    const maxedBrawlers =
        brawlers.filter(function (brawler) {
            return brawler.power === 11;
        }).length;

    let averageTrophies = 0;

    if (totalBrawlers > 0) {

        const totalTrophies =
            brawlers.reduce(function (total, brawler) {

                return total + (brawler.trophies || 0);

            }, 0);

        averageTrophies =
            Math.round(
                totalTrophies / totalBrawlers
            );
    }

    let highestBrawler = "-";

    if (totalBrawlers > 0) {

        const highest =
            [...brawlers].sort(function (a, b) {

                return (b.trophies || 0) -
                    (a.trophies || 0);

            })[0];

        highestBrawler =
            highest.name;
    }

    const totalBrawlersElement =
        document.getElementById("totalBrawlers");

    const maxedBrawlersElement =
        document.getElementById("maxedBrawlers");

    const averageTrophiesElement =
        document.getElementById("averageTrophies");

    const highestBrawlerElement =
        document.getElementById("highestBrawler");

    const threeVsThreeElement =
        document.getElementById("threeVsThree");

    const soloVictoriesElement =
        document.getElementById("soloVictories");

    const duoVictoriesElement =
        document.getElementById("duoVictories");


    if (totalBrawlersElement) {
        totalBrawlersElement.textContent =
            totalBrawlers;
    }

    if (maxedBrawlersElement) {
        maxedBrawlersElement.textContent =
            maxedBrawlers;
    }

    if (averageTrophiesElement) {
        averageTrophiesElement.textContent =
            averageTrophies.toLocaleString();
    }

    if (highestBrawlerElement) {
        highestBrawlerElement.textContent =
            highestBrawler;
    }

    if (threeVsThreeElement) {
        threeVsThreeElement.textContent =
            (data["3vs3Victories"] || 0).toLocaleString();
    }

    if (soloVictoriesElement) {
        soloVictoriesElement.textContent =
            (data.soloVictories || 0).toLocaleString();
    }

    if (duoVictoriesElement) {
        duoVictoriesElement.textContent =
            (data.duoVictories || 0).toLocaleString();
    }
}


// ==========================================
// BRAWLER ANALYTICS
// ==========================================

function updateBrawlerAnalytics(data) {

    const brawlers = data.brawlers || [];

    if (brawlers.length === 0) {
        return;
    }


    // Total trophies across all brawlers

    const totalTrophies =
        brawlers.reduce(function (total, brawler) {

            return total + (brawler.trophies || 0);

        }, 0);


    // Average trophies

    const averageTrophies =
        Math.round(
            totalTrophies / brawlers.length
        );


    // Highest trophy brawler

    const highestBrawler =
        [...brawlers].sort(function (a, b) {

            return (b.trophies || 0) -
                (a.trophies || 0);

        })[0];


    // Power 11 count

    const power11Count =
        brawlers.filter(function (brawler) {

            return brawler.power === 11;

        }).length;


    // ======================================
    // UPDATE HTML
    // ======================================

    document.getElementById(
        "totalBrawlerTrophies"
    ).textContent =
        totalTrophies.toLocaleString();


    document.getElementById(
        "analyticsAverageTrophies"
    ).textContent =
        averageTrophies.toLocaleString();


    document.getElementById(
        "analyticsHighestBrawler"
    ).textContent =
        highestBrawler.name;


    document.getElementById(
        "analyticsPower11"
    ).textContent =
        power11Count;
}


// ==========================================
// TOP 10 BRAWLERS CHART
// ==========================================

function updateTopBrawlersChart(data) {

    const brawlers = data.brawlers || [];

    if (brawlers.length === 0) {
        return;
    }

    // Sort brawlers by trophies

    const topBrawlers =
        [...brawlers]
            .sort(function (a, b) {
                return (b.trophies || 0) -
                    (a.trophies || 0);
            })
            .slice(0, 10);


    // Get names

    const names =
        topBrawlers.map(function (brawler) {
            return brawler.name;
        });


    // Get trophies

    const trophies =
        topBrawlers.map(function (brawler) {
            return brawler.trophies || 0;
        });


    const canvas =
        document.getElementById(
            "topBrawlersChart"
        );


    // Destroy old chart if it exists

    if (topBrawlersChart) {

        topBrawlersChart.destroy();

    }


    // Create chart

    topBrawlersChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels: names,

                datasets: [

                    {
                        label: "Trophies",

                        data: trophies
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    y: {

                        beginAtZero: true

                    }

                }

            }

        });

}


// ==========================================
// POWER LEVEL DISTRIBUTION CHART
// ==========================================

function updatePowerLevelChart(data) {

    const brawlers = data.brawlers || [];

    if (brawlers.length === 0) {
        return;
    }


    // Count brawlers for each power level

    const powerLevels = {};

    brawlers.forEach(function (brawler) {

        const power =
            brawler.power;

        if (!powerLevels[power]) {
            powerLevels[power] = 0;
        }

        powerLevels[power]++;

    });


    // Sort power levels from lowest to highest

    const levels =
        Object.keys(powerLevels)
            .sort(function (a, b) {
                return Number(a) - Number(b);
            });


    const counts =
        levels.map(function (level) {
            return powerLevels[level];
        });


    const canvas =
        document.getElementById(
            "powerLevelChart"
        );


    // Destroy old chart

    if (powerLevelChart) {

        powerLevelChart.destroy();

    }


    // Create chart

    powerLevelChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels: levels.map(function (level) {
                    return "Power " + level;
                }),

                datasets: [

                    {
                        label: "Brawlers",
                        data: counts
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    mode: "index",

                    intersect: false

                },

                plugins: {

                    legend: {

                        display: false

                    },

                    tooltip: {

                        callbacks: {

                            label: function (context) {

                                const count =
                                    context.raw;

                                return `${count} brawler${count === 1 ? "" : "s"}`;

                            }

                        }

                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            precision: 0

                        }

                    }

                }

            }

        });

}


// ==========================================
// TROPHY DISTRIBUTION CHART
// ==========================================

function updateTrophyDistributionChart(data) {

    const brawlers = data.brawlers || [];

    if (brawlers.length === 0) {
        return;
    }


    // ======================================
    // TROPHY RANGES
    // ======================================

    const ranges = [

        {
            label: "0-499",
            min: 0,
            max: 499,
            count: 0
        },

        {
            label: "500-999",
            min: 500,
            max: 999,
            count: 0
        },

        {
            label: "1000-1499",
            min: 1000,
            max: 1499,
            count: 0
        },

        {
            label: "1500-1999",
            min: 1500,
            max: 1999,
            count: 0
        },

        {
            label: "2000-2499",
            min: 2000,
            max: 2499,
            count: 0
        },

        {
            label: "2500+",
            min: 2500,
            max: Infinity,
            count: 0
        }

    ];


    // ======================================
    // COUNT BRAWLERS
    // ======================================

    brawlers.forEach(function (brawler) {

        const trophies =
            Number(brawler.trophies) || 0;


        ranges.forEach(function (range) {

            if (
                trophies >= range.min &&
                trophies <= range.max
            ) {

                range.count++;

            }

        });

    });


    // ======================================
    // GET LABELS & COUNTS
    // ======================================

    const labels =
        ranges.map(function (range) {
            return range.label;
        });


    const counts =
        ranges.map(function (range) {
            return range.count;
        });


    // ======================================
    // GET CANVAS
    // ======================================

    const canvas =
        document.getElementById(
            "trophyDistributionChart"
        );


    // ======================================
    // DESTROY OLD CHART
    // ======================================

    if (trophyDistributionChart) {

        trophyDistributionChart.destroy();

    }


    // ======================================
    // CREATE CHART
    // ======================================

    trophyDistributionChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {
                        label: "Brawlers",
                        data: counts
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    mode: "index",

                    intersect: false

                },

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        callbacks: {

                            label: function (context) {

                                const count =
                                    context.raw;

                                return `${count} brawler${count === 1 ? "" : "s"}`;

                            }

                        }

                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            precision: 0

                        }

                    }

                }

            }

        });

}


// ==========================================
// DISPLAY BRAWLERS
// ==========================================

function displayBrawlers(brawlers) {

    const brawlerCount =
        document.getElementById("brawlerCount");

    if (brawlerCount) {

        brawlerCount.textContent =
            `Showing ${brawlers.length} brawler${brawlers.length === 1 ? "" : "s"}`;

    }

    brawlerList.innerHTML = "";

    if (!brawlers || brawlers.length === 0) {

        brawlerList.innerHTML = `
            <p class="no-results">
                No brawlers found.
            </p>
        `;

        return;
    }

    brawlers.forEach(function (brawler) {

        const card =
            document.createElement("div");

        card.classList.add("brawler-card");

        card.innerHTML = `

            <div class="brawler-header">

                <div class="brawler-info">

                    <img
                        src="https://cdn.brawlify.com/brawlers/borderless/${brawler.id}.png"
                        alt="${brawler.name}"
                        class="brawler-image"
                        onerror="this.style.display='none'"
                    >

                    <div>
                        <h3>${brawler.name}</h3>
                        <span>Rank ${brawler.rank}</span>
                    </div>

                </div>

            </div>

            <div class="power-level">
                Power ${brawler.power}
            </div>

            <div class="trophy-section">

                <span>
                    Trophies
                </span>

                <strong>
                    ${brawler.trophies.toLocaleString()}
                </strong>

            </div>

            <div class="brawler-stats">

                <div>
                    <span>Highest</span>
                    <strong>
                        ${brawler.highestTrophies.toLocaleString()}
                    </strong>
                </div>

            </div>

            <div class="ability-section">

                <div class="ability-group">

                    <span>Gadgets</span>

                    <div class="ability-icons">

                        ${
                            brawler.gadgets?.length
                                ? brawler.gadgets.map(function (gadget) {
                                    return `
                                        <img
                                            src="https://cdn.brawlify.com/gadgets/borderless/${gadget.id}.png"
                                            alt="${gadget.name}"
                                            title="${gadget.name}"
                                            class="ability-icon"
                                            onerror="this.style.display='none'"
                                        >
                                    `;
                                }).join("")
                                : `<small>None</small>`
                        }

                    </div>

                </div>

                <div class="ability-group">

                    <span>Star Powers</span>

                    <div class="ability-icons">

                        ${
                            brawler.starPowers?.length
                                ? brawler.starPowers.map(function (starPower) {
                                    return `
                                        <img
                                            src="https://cdn.brawlify.com/star-powers/borderless/${starPower.id}.png"
                                            alt="${starPower.name}"
                                            title="${starPower.name}"
                                            class="ability-icon"
                                            onerror="this.style.display='none'"
                                        >
                                    `;
                                }).join("")
                                : `<small>None</small>`
                        }

                    </div>

                </div>

            </div>

            <div class="hypercharge-section">

                <span>Hypercharge</span>

                ${
                    brawler.hyperCharges?.length
                        ? `
                            <div class="hypercharge-info">
                                <strong>
                                    ${brawler.hyperCharges[0].name}
                                </strong>
                            </div>
                          `
                        : `
                            <div class="hypercharge-info">
                                <small>None</small>
                            </div>
                          `
                }

            </div>

        `;

        brawlerList.appendChild(card);

    });
}


// ==========================================
// BRAWLER SEARCH
// ==========================================

function filterBrawlers() {

    const searchText =
        brawlerSearch.value.toLowerCase().trim();

    const power =
        powerFilter.value;

    const sort =
        sortBrawlers.value;


    let filtered =
        allBrawlers.filter(function (brawler) {

            const matchesSearch =
                brawler.name
                    .toLowerCase()
                    .includes(searchText);


            const matchesPower =
                power === "all" ||
                brawler.power.toString() === power;


            return matchesSearch && matchesPower;

        });


    // ======================================
    // SORTING
    // ======================================

    if (sort === "trophies") {

        filtered.sort(function (a, b) {

            return sortAscending
                ? a.trophies - b.trophies
                : b.trophies - a.trophies;

        });

    } else if (sort === "highestTrophies") {

        filtered.sort(function (a, b) {

            return sortAscending
                ? a.highestTrophies - b.highestTrophies
                : b.highestTrophies - a.highestTrophies;

        });

    } else if (sort === "rank") {

        filtered.sort(function (a, b) {

            return sortAscending
                ? a.rank - b.rank
                : b.rank - a.rank;

        });

    } else if (sort === "power") {

        filtered.sort(function (a, b) {

            return sortAscending
                ? a.power - b.power
                : b.power - a.power;

        });

    }

    displayBrawlers(filtered);
}


// ==========================================
// GET BATTLE LOG
// ==========================================

async function getBattleLog(tag) {

    battleLog.innerHTML = `
        <p class="no-results">
            Loading recent battles...
        </p>
    `;

    try {

        const response = await fetch(
            `http://localhost:5000/api/battlelog/${encodeURIComponent(tag)}`
        );

        const data = await response.json();

        updateBattleSummary(data.items || []);

        if (!response.ok) {
            throw new Error(data.error);
        }

        const battles =
            data.items || [];

        recordBattleActivity(
            battles,
            tag
        );

        displayBattleLog(
            battles,
            tag
        );

        displayActivityHeatmap(
            tag
        );

    } catch (error) {

        console.error(error);

        battleLog.innerHTML = `
            <p class="no-results">
                Unable to load battle log.
            </p>
        `;

    }
}


// ==========================================
// DISPLAY BATTLE LOG
// ==========================================

function displayBattleLog(battles, tag) {

    battleLog.innerHTML = "";

    if (!battles || battles.length === 0) {

        battleLog.innerHTML = `
            <p class="no-results">
                No recent battles found.
            </p>
        `;

        return;
    }


    const visibleBattles =
        showAllBattles
            ? battles
            : battles.slice(0, 3);


    visibleBattles.forEach(function (battle) {

        const battleData =
            battle.battle;


        let result = "Battle";

        let trophyChange = null;

        let brawlerName = "Unknown";

        let player = null;


        // ==================================
        // FIND PLAYER IN TEAMS
        // ==================================

        if (battleData.teams) {

            const allPlayers =
                battleData.teams.flat();

            player =
                allPlayers.find(function (p) {

                    return p.tag === tag;

                });

        }


        // ==================================
        // FIND PLAYER IN SHOWDOWN / DUELS
        // ==================================

        if (!player && battleData.players) {

            player =
                battleData.players.find(function (p) {

                    return p.tag === tag;

                });

        }


        // ==================================
        // RESULT
        // ==================================

        if (battleData.result) {

            result =
                battleData.result;

        }


        // ==================================
        // TROPHY CHANGE
        // ==================================

        if (
            battleData.trophyChange !==
            undefined
        ) {

            trophyChange =
                battleData.trophyChange;

        }


        // ==================================
        // BRAWLER
        // ==================================

        if (player?.brawler) {

            brawlerName =
                player.brawler.name;

        } else if (player?.brawlers) {

            brawlerName =
                player.brawlers
                    .map(function (brawler) {

                        return brawler.name;

                    })
                    .join(" / ");

        }


        // ==================================
        // GAME MODES
        // ==================================

        const modeNames = {

            brawlBall: "Brawl Ball",

            gemGrab: "Gem Grab",

            bounty: "Bounty",

            heist: "Heist",

            knockout: "Knockout",

            soloShowdown: "Solo Showdown",

            duoShowdown: "Duo Showdown",

            duels: "Duels"

        };


        const mode =
            modeNames[battle.event.mode] ||
            battle.event.mode ||
            "Unknown Mode";


        // ==================================
        // MAP
        // ==================================

        const map =
            battle.event.map ||
            "Unknown Map";


        // ==================================
        // DURATION
        // ==================================

        let duration = "";

        if (battleData.duration) {

            const minutes =
                Math.floor(
                    battleData.duration / 60
                );

            const seconds =
                battleData.duration % 60;

            duration =
                `${minutes}m ${seconds}s`;

        }


        // ==================================
        // BATTLE TIME
        // ==================================

        const rawBattleTime =
            battle.battleTime;


        let formattedTime =
            "Unknown Time";


        if (rawBattleTime) {

            const formattedBattleTime =
                rawBattleTime.replace(
                    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
                    "$1-$2-$3T$4:$5:$6"
                );


            const battleTime =
                new Date(formattedBattleTime);


            if (!isNaN(battleTime)) {

                formattedTime =
                    battleTime.toLocaleString();

            }

        }


        // ==================================
        // SHOWDOWN RANK
        // ==================================

        let rankText = "";

        if (battleData.rank) {

            rankText =
                `Rank #${battleData.rank}`;

        }


        // ==================================
        // TROPHY TEXT
        // ==================================

        let trophyText =
            "— 🏆";

        let trophyClass =
            "";


        if (trophyChange !== null) {

            trophyText =
                trophyChange > 0
                    ? `+${trophyChange} 🏆`
                    : `${trophyChange} 🏆`;


            if (trophyChange > 0) {

                trophyClass =
                    "positive";

            } else if (trophyChange < 0) {

                trophyClass =
                    "negative";

            }

        }


        // ==================================
        // RESULT CLASS
        // ==================================

        const resultClass =
            result.toLowerCase() === "victory"
                ? "victory"
                : result.toLowerCase() === "defeat"
                    ? "defeat"
                    : "";


        // ==================================
        // CREATE CARD
        // ==================================

        const card =
            document.createElement("div");

        card.classList.add(
            "battle-card"
        );


        card.innerHTML = `

            <div class="battle-header">

                <span class="battle-result ${resultClass}">
                    ${result.toUpperCase()}
                </span>

                <span class="battle-trophies ${trophyClass}">
                    ${trophyText}
                </span>

            </div>


            <div class="battle-details">

                <span>
                    ${mode}
                </span>

                <span>
                    ${map}
                </span>

                ${
                    rankText
                        ? `<span>${rankText}</span>`
                        : ""
                }

                ${
                    duration
                        ? `<span>${duration}</span>`
                        : ""
                }

                <span>
                    ${formattedTime}
                </span>

            </div>


            <div class="battle-brawler">

                Brawler:

                <strong>
                    ${brawlerName}
                </strong>

            </div>

        `;


        battleLog.appendChild(card);

    });


    // ======================================
    // SHOW MORE / LESS
    // ======================================

    if (battles.length > 3) {

        const toggleButton =
            document.createElement("button");


        toggleButton.classList.add(
            "show-more-battles"
        );


        if (showAllBattles) {

            toggleButton.textContent =
                "Show Less";

        } else {

            toggleButton.textContent =
                `Show More (${battles.length - 3})`;

        }


        toggleButton.addEventListener(
            "click",
            function () {

                showAllBattles =
                    !showAllBattles;


                displayBattleLog(
                    battles,
                    tag
                );

            }
        );


        battleLog.appendChild(
            toggleButton
        );

    }

}


// ==========================================
// RECORD BRAWL ACTIVITY
// ==========================================

function recordBattleActivity(
    battles,
    tag
) {

    if (!battles || battles.length === 0) {
        return;
    }


    const storageKey =
        `brawlActivity_${tag}`;


    const savedData =
        JSON.parse(
            localStorage.getItem(storageKey)
        ) || {
            dates: {},
            battles: []
        };


    battles.forEach(function (battle) {

        const battleTime =
            battle.battleTime;


        if (!battleTime) {
            return;
        }


        const battleId =
            `${battleTime}_${battle.event?.id}_${battle.event?.mode}_${battle.event?.map}`;


        if (
            savedData.battles.includes(
                battleId
            )
        ) {

            return;

        }


        const rawDate =
            battleTime.substring(0, 8);


        const year =
            rawDate.substring(0, 4);

        const month =
            rawDate.substring(4, 6);

        const day =
            rawDate.substring(6, 8);


        const date =
            `${year}-${month}-${day}`;


        if (!savedData.dates[date]) {

            savedData.dates[date] =
                0;

        }


        savedData.dates[date]++;

        savedData.battles.push(
            battleId
        );

    });


    localStorage.setItem(
        storageKey,
        JSON.stringify(savedData)
    );


    console.log(
        "Brawl Activity saved:",
        savedData
    );

}


// ==========================================
// DISPLAY BRAWL ACTIVITY
// ==========================================

function displayActivityHeatmap(tag) {

    if (!activityHeatmap) {
        return;
    }


    const storageKey =
        `brawlActivity_${tag}`;


    const savedData =
        JSON.parse(
            localStorage.getItem(storageKey)
        ) || {
            dates: {},
            battles: []
        };


    activityHeatmap.innerHTML = "";


    const totalBattles =
        savedData.battles.length;


    // ==========================================
    // MAIN CALENDAR CONTAINER
    // ==========================================

    const calendar =
        document.createElement("div");

    calendar.classList.add(
        "activity-calendar"
    );


    // ==========================================
    // SUMMARY
    // ==========================================

    const summary =
        document.createElement("p");

    summary.classList.add(
        "activity-summary"
    );


    summary.textContent =
        `${totalBattles} battles recorded`;


    activityHeatmap.appendChild(
        summary
    );


    // ==========================================
    // CREATE LAST 365 DAYS
    // ==========================================

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    // Move to Sunday so the calendar
    // starts with a complete week

    const startDate =
        new Date(today);


    startDate.setDate(
        today.getDate() -
        today.getDay() -
        (52 * 7)
    );


    // ==========================================
    // MONTH LABELS
    // ==========================================

    const monthsContainer =
        document.createElement("div");


    monthsContainer.classList.add(
        "activity-months"
    );


    let previousMonth = -1;


    for (
        let week = 0;
        week < 53;
        week++
    ) {

        const weekDate =
            new Date(startDate);


        weekDate.setDate(
            startDate.getDate() +
            (week * 7)
        );


        const month =
            weekDate.getMonth();


        const monthLabel =
            document.createElement("span");


        monthLabel.classList.add(
            "activity-month"
        );


        if (
            month !== previousMonth
        ) {

            monthLabel.textContent =
                weekDate.toLocaleString(
                    "default",
                    {
                        month: "short"
                    }
                );


            previousMonth =
                month;

        }


        monthsContainer.appendChild(
            monthLabel
        );

    }


    calendar.appendChild(
        monthsContainer
    );


    // ==========================================
    // CALENDAR BODY
    // ==========================================

    const calendarBody =
        document.createElement("div");


    calendarBody.classList.add(
        "activity-calendar-body"
    );


    // ==========================================
    // WEEKDAY LABELS
    // ==========================================

    const weekdays =
        document.createElement("div");


    weekdays.classList.add(
        "activity-weekdays"
    );


    const weekdayNames = [
        "",
        "Mon",
        "",
        "Wed",
        "",
        "Fri",
        ""
    ];


    weekdayNames.forEach(
        function (day) {

            const span =
                document.createElement("span");


            span.textContent =
                day;


            weekdays.appendChild(
                span
            );

        }
    );


    calendarBody.appendChild(
        weekdays
    );


    // ==========================================
    // ACTIVITY GRID
    // ==========================================

    const grid =
        document.createElement("div");


    grid.classList.add(
        "activity-grid"
    );


    for (
        let dayIndex = 0;
        dayIndex < (53 * 7);
        dayIndex++
    ) {

        const date =
            new Date(startDate);


        date.setDate(
            startDate.getDate() +
            dayIndex
        );


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");


        const day =
            String(
                date.getDate()
            ).padStart(2, "0");


        const dateKey =
            `${year}-${month}-${day}`;


        const count =
            savedData.dates[dateKey] || 0;


        // ======================================
        // ACTIVITY LEVEL
        // ======================================

        let level = 0;


        if (count >= 1 && count <= 2) {

            level = 1;

        } else if (
            count >= 3 &&
            count <= 5
        ) {

            level = 2;

        } else if (
            count >= 6 &&
            count <= 9
        ) {

            level = 3;

        } else if (count >= 10) {

            level = 4;

        }


        // ======================================
        // CREATE CELL
        // ======================================

        const cell =
            document.createElement("div");


        cell.classList.add(
            "activity-cell"
        );


        cell.classList.add(
            `level-${level}`
        );


        // Tooltip

        cell.title =
            count === 0
                ? `${dateKey}: No battles`
                : `${dateKey}: ${count} battle${count === 1 ? "" : "s"}`;


        grid.appendChild(
            cell
        );

    }


    calendarBody.appendChild(
        grid
    );


    calendar.appendChild(
        calendarBody
    );


    activityHeatmap.appendChild(
        calendar
    );


    // ==========================================
    // LEGEND
    // ==========================================

    const legend =
        document.createElement("div");


    legend.classList.add(
        "activity-legend"
    );


    const less =
        document.createElement("span");


    less.textContent =
        "Less";


    legend.appendChild(
        less
    );


    for (
        let level = 0;
        level <= 4;
        level++
    ) {

        const legendCell =
            document.createElement("span");


        legendCell.classList.add(
            "activity-legend-cell"
        );


        legendCell.classList.add(
            `level-${level}`
        );


        legend.appendChild(
            legendCell
        );

    }


    const more =
        document.createElement("span");


    more.textContent =
        "More";


    legend.appendChild(
        more
    );


    activityHeatmap.appendChild(
        legend
    );

}


// ==========================================
// EVENT LISTENERS
// ==========================================

searchBtn.addEventListener(
    "click",
    getPlayer
);


playerTag.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            getPlayer();

        }

    }
);


brawlerSearch.addEventListener(
    "input",
    filterBrawlers
);


powerFilter.addEventListener(
    "change",
    filterBrawlers
);


sortBrawlers.addEventListener(
    "change",
    filterBrawlers
);


// ==========================================
// THEME
// ==========================================

themeToggle.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "light-theme"
        );


        if (
            document.body.classList.contains(
                "light-theme"
            )
        ) {

            themeToggle.textContent =
                "Dark Mode";


            localStorage.setItem(
                "brawlstatsTheme",
                "light"
            );

        } else {

            themeToggle.textContent =
                "Light Mode";


            localStorage.setItem(
                "brawlstatsTheme",
                "dark"
            );

        }

    }
);


const savedTheme =
    localStorage.getItem(
        "brawlstatsTheme"
    );


if (savedTheme === "light") {

    document.body.classList.add(
        "light-theme"
    );

    themeToggle.textContent =
        "Dark Mode";

}


// ==========================================
// BATTLE SUMMARY
// ==========================================

function updateBattleSummary(battles) {

    const totalBattles =
        battles.length;


    const victories =
        battles.filter(function (battle) {

            return battle.battle?.result === "victory";

        }).length;


    const defeats =
        battles.filter(function (battle) {

            return battle.battle?.result === "defeat";

        }).length;


    let winRate = 0;


    if (totalBattles > 0) {

        winRate =
            Math.round(
                (victories / totalBattles) * 100
            );

    }


    document.getElementById(
        "totalBattles"
    ).textContent =
        totalBattles;


    document.getElementById(
        "battleVictories"
    ).textContent =
        victories;


    document.getElementById(
        "battleDefeats"
    ).textContent =
        defeats;


    document.getElementById(
        "battleWinRate"
    ).textContent =
        `${winRate}%`;

}


// ==========================================
// RESET BRAWLERS
// ==========================================

resetBrawlers.addEventListener(
    "click",
    function () {

        brawlerSearch.value = "";

        powerFilter.value = "all";

        sortBrawlers.value = "default";


        sortAscending = false;

        sortDirection.textContent =
            "Descending";


        displayBrawlers(
            allBrawlers
        );

    }
);


// ==========================================
// SORT DIRECTION
// ==========================================

sortDirection.addEventListener(
    "click",
    function () {

        sortAscending =
            !sortAscending;


        if (sortAscending) {

            sortDirection.textContent =
                "Ascending";

        } else {

            sortDirection.textContent =
                "Descending";

        }


        filterBrawlers();

    }
);