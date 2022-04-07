let weekNumber,
    periodNumber

go()
window.addEventListener('popstate', function (event) { go() })

async function go() {
    weekNumber = getWeekNumber(new Date())
    periodNumber = getPeriodNumber(weekNumber)
    console.log(periodNumber)
    if (document.location.hash.startsWith("#/vandaag")) vandaag()
    else if (document.location.hash.startsWith("#/agenda")) agenda()
    else if (document.location.href.endsWith("/studiewijzer")) studiewijzers()
    else if (document.location.href.includes("/studiewijzer/")) studiewijzer()
    else if (document.location.href.includes("/opdrachten")) opdrachten()

    await awaitElement("#user-menu img")
    document.querySelector("#user-menu img").style.display = "none"
}

async function vandaag() {
    await awaitElement("ul.agenda-list>li.alert")
    document.querySelectorAll("li.alert").forEach(e => { e.classList.remove("alert") })
    const e = document.querySelector('h4[data-ng-bind-template*="Wijzigingen voor"]')
    e.innerHTML = e.innerHTML.replace("Wijzigingen voor", "Rooster voor")
    document.querySelectorAll(".block").forEach(e => {
        e.style.borderRadius = "6px"
    })
    // let dateText = document.querySelector("div.title"),
    //     year = new Date().getFullYear()
    // dateText.innerHTML = dateText.innerHTML.split(year) + `(week ${getWeekNumber(new Date())})`
}

async function agenda() {
    await awaitElement("tr.ng-scope")
    document.querySelectorAll("tr.ng-scope").forEach(e => {
        e.style.height = "40px"
    })
}

async function studiewijzers() {
    await awaitElement(`li[data-ng-repeat="studiewijzer in items"]`)
    setTimeout(() => {
        const regex = new RegExp(`.*(period([A-z]*)(\s*)(.*)${periodNumber}).*|.*((p|t)(\s*)(.*)${periodNumber}).*`, "gi"),
            titles = document.querySelectorAll(`ul>[data-ng-repeat="studiewijzer in items"]`)

        titles.forEach(title => {
            const label = title.firstElementChild.firstElementChild.innerHTML
            if (regex.test(label.toLowerCase())) {
                console.log(label, label.match(regex), regex.test(label))
                title.style.background = "aliceBlue"
                title.parentElement.prepend(title)
            }
        })
    }, 200)
}

async function studiewijzer() {
    await awaitElement("li.studiewijzer-onderdeel")
    const regex = new RegExp(`(?<![0-9])(${weekNumber}){1}(?![0-9])`, "g"),
        titles = document.querySelectorAll("li.studiewijzer-onderdeel>div.block>h3>b.ng-binding")
    let matched = false

    titles.forEach(title => {
        if (regex.test(title.innerHTML)) {
            title.parentElement.style.background = "aliceBlue"
            title.click()
            const endlink = title.parentElement.nextElementSibling.lastElementChild
            endlink.style.background = "aliceBlue"
            if (!matched) setTimeout(() => {
                endlink.scrollIntoView({ behavior: "smooth", block: "center" })
            }, 250)
            matched = true
        }
    })
}

async function opdrachten() {
    await awaitElement("tr.ng-scope")
    document.querySelectorAll(".overdue").forEach(e => { e.style.background = "lavenderBlush" })
    document.querySelectorAll('td[data-ng-bind*="InleverenVoor"]').forEach(e => {
        let d = new Date("20" + e.innerHTML.split("-")[2], Number(Number(e.innerHTML.split("-")[1]) - 1), e.innerHTML.split("-")[0])
        let opt = { weekday: "short", year: "2-digit", month: "short", day: "numeric" }
        if (d.toLocaleDateString("nl-NL", opt) != "Invalid Date") e.innerHTML = d.toLocaleDateString("nl-NL", opt)
    })
}

async function awaitElement(s) {
    return new Promise(p => {
        setInterval(() => {
            if (document.querySelector(s)) { p() }
        }, 10)
    })
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

function getPeriodNumber(w) {
    if (w >= 35 && w < 45)
        return 1

    if (w >= 45 || w < 4)
        return 2

    if (w >= 4 && w < 14)
        return 3

    if (w >= 14 && w < 25)
        return 4

    return 0
}