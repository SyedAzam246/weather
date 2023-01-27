import axios from "axios"
import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import path from "path"
dotenv.config()


const app = express();
app.use(cors())
// app.use('/dist',express.static('dist'))
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
   const {searchQuery} = req.query
   axios.get('http://api.weatherapi.com/v1/forecast.json', {
       params: {
           key: process.env.API_KEY,
           q: searchQuery,
           days: 8,
           aqi: 'no'
        }
    }).then(({ data }) => {
        console.log(searchQuery)
        res.json({
            current: parseCurrentWeather(data),
            hourly: parseHourlyWeather(data),
            daily: parseDailyWeather(data)
            
        })
    }).catch(e => {
        console.log(e)
        res.sendStatus(500)
    })

    function parseCurrentWeather ({ current, forecast, location }) {
        const { temp_c: currentTemp, condition, precip_in, feelslike_c,humidity, wind_kph} = current;
        const { forecastday } = forecast;
        const { name, region, country } = location;

        return {
            currentTemp: Math.round(currentTemp),
            icon: condition.icon,
            description: condition.text,
            humidity: humidity,
            feelslike: Math.round(feelslike_c),
            windSpeed: Math.round(wind_kph),
            precip: forecastday[0].day.daily_chance_of_rain,
            highTemp: Math.round(forecastday[0].day.maxtemp_c),
            lowTemp: Math.round(forecastday[0].day.mintemp_c),
            city: name,
            state: region,
            country: country
        }
    }

    function parseDailyWeather ( { forecast }) {
        const { forecastday } = forecast;

       return forecastday.splice(1).map( daily => {
            return {
                icon: daily.day.condition.icon,
                date: daily.date,
                temp: Math.round(daily.day.avgtemp_c)
            }
        })
    }

    function parseHourlyWeather({ current, forecast}) {
            const {last_updated} = current;
            const {forecastday } = forecast;
            let currentTime = last_updated.substr(11)
           return forecastday[0].hour.filter(val =>  val.time.substr(11) > currentTime ).map(hourly => {
            return {
                timeStampe: hourly.time,
                icon: hourly.condition.icon,
                temp: Math.round(hourly.temp_c),
                feelslike: Math.round(hourly.feelslike_c),
                windSpeed: Math.round(hourly.wind_kph),
                precip: hourly.chance_of_rain
            }
           })
    }
})


app.listen(process.env.PORT || 3001)