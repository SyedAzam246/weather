import axios from "axios"
import { format, set } from "date-fns";

const inputField = document.getElementById('input-field');
const btn = document.getElementById('submit-btn');
let searchData = '';

btn.addEventListener('click', getLocationInput)
inputField.addEventListener('keyup', function(event){
    if (event.key === "Enter") {
        getLocationInput();
        console.log(searchData)
    }
});
window.onload = function () {
    navigator.geolocation.getCurrentPosition(positionSuccess, positionError)
    
}

function getLocationInput () {
    searchData = inputField.value;
    getWeather(searchData)
    inputField.value = ''
    inputField.blur()
}



function positionSuccess ({coords}) {    
    getWeather(`${coords.latitude},${coords.longitude}`)
    
}

function positionError () {
    alert('There was an error getting your location. Please allow us to access your location and refresh the page')
}

function getWeather (searchQuery) {
    axios.get(`http://localhost:${process.env.PORT||3001}/`, {
        params: {searchQuery}
    }).then(res => {
        renderWeather(res.data)
        console.log(res.data)
    }).catch(e => {
        document.querySelector('.warning-text').style.visibility = 'visible'
        alert('Error Getting your weather, try again')
        
    })
}

function renderWeather ({current, daily, hourly}) {
    document.body.classList.remove('blurred')
    renderCurrentWeather(current);
    renderDailyWeather(daily);
    renderHourlyWeather(hourly)
}
function setValue (selector, value, { parent = document} = {}) {
    parent.querySelector(`[data-${selector}]`).textContent = value;
}
const currentIcon = document.querySelector('[data-current-icon]')
function renderCurrentWeather(current) {
    document.querySelector('.warning-text').style.visibility = 'hidden'
    currentIcon.src = current.icon
    setValue('current-temp', current.currentTemp);
    setValue('current-description', current.description)
    setValue('current-temp-high',current.highTemp)
    setValue('current-temp-low', current.lowTemp)
    setValue('current-wind', current.windSpeed)
    setValue('current-precip', current.precip)
    setValue('current-humidity', current.humidity)
    setValue('current-feels-like', current.feelslike)
    setValue('loc-city-name', `${current.city},`)
    setValue('loc-state-name', current.state)
    setValue('loc-country-name', current.country)

}

const dailySection = document.querySelector('[data-daily-section]');
const dailyCardTemplate = document.getElementById('daily-card-template')

function formatDate (timeStamp) {
    return format(new Date(timeStamp), 'eeee')
}
function formatTime (timeStamp) {
    return format(new Date(timeStamp), 'ha' )
}
function renderDailyWeather (daily) {
    dailySection.innerHTML = ''
    
    daily.forEach(day => {
        const element = dailyCardTemplate.content.cloneNode(true);
        setValue('daily-timeStamp', formatDate(day.date), { parent: element })
        setValue('daily-temp', day.temp, {parent: element})
        element.querySelector('[data-daily-icon]').src = day.icon
        dailySection.append(element)
    })
}
const hourlyRowTemplate = document.getElementById('hourly-row-template');
const hourlyTable = document.querySelector('[data-hourly-table]')

function renderHourlyWeather(hourly) {
    hourlyTable.innerHTML = '';
    hourly.forEach(hour => {
        const element = hourlyRowTemplate.content.cloneNode(true);
        setValue('hourly-feelslike', hour.feelslike, {parent : element})
        setValue('hourly-precip', hour.precip, {parent : element})
        setValue('hourly-wind', hour.windSpeed, {parent : element})
        setValue('hourly-temp', hour.temp, {parent : element})
        setValue('hourly-timeStamp', formatTime(hour.timeStampe), {parent : element})
        setValue('hourly-dayStamp', formatDate(hour.timeStampe), {parent : element})
        element.querySelector('[data-hourly-icon]').src = hour.icon
        hourlyTable.append(element)

    })
}