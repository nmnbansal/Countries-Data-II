import fetch from 'node-fetch';

async function fetchCountriesData(retries = 3) {
    const url = 'https://restcountries.com/v3.1/all';
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (i === retries - 1) {
                console.error(`Failed to fetch data after ${retries} attempts:`, error);
                throw error;
            }
            console.warn(`Retrying fetch... (${i + 1}/${retries})`);
        }
    }
}

async function getTopCountriesByArea(n) {
    const countries = await fetchCountriesData();
    const sortedCountries = countries.sort((a, b) => b.area - a.area);
    return sortedCountries.slice(0, n).map(country => country.name.common);
}

async function getTopCountriesByPopulation(n) {
    const countries = await fetchCountriesData();
    const sortedCountries = countries.sort((a, b) => b.population - a.population);
    return sortedCountries.slice(0, n).map(country => country.name.common);
}

async function getCountriesByLanguage(language) {
    const countries = await fetchCountriesData();
    return countries
        .filter(country => country.languages && Object.values(country.languages).includes(language))
        .map(country => country.name.common);
}

async function getCountriesByCurrency(currency) {
    const countries = await fetchCountriesData();
    return countries
        .filter(country => country.currencies && Object.values(country.currencies).some(curr => curr.name === currency))
        .map(country => country.name.common);
}

async function getLandlockedCountries() {
    const countries = await fetchCountriesData();
    return countries
        .filter(country => country.landlocked)
        .map(country => country.name.common);
}

async function getCountryWithHighestGini() {
    const countries = await fetchCountriesData();
    let highestGiniCountry = null;
    let highestGiniValue = -1;
    countries.forEach(country => {
        if (country.gini) {
            const giniValues = Object.values(country.gini);
            const maxGini = Math.max(...giniValues);
            if (maxGini > highestGiniValue) {
                highestGiniValue = maxGini;
                highestGiniCountry = country.name.common;
            }
        }
    });
    return { name: highestGiniCountry, gini: highestGiniValue };
}

async function getCountriesBySubregion(subregion) {
    const countries = await fetchCountriesData();
    return countries
        .filter(country => country.subregion === subregion)
        .map(country => country.name.common);
}

async function getCountriesByTimezone(timezone) {
    const countries = await fetchCountriesData();
    return countries
        .filter(country => country.timezones && country.timezones.includes(timezone))
        .map(country => country.name.common);
}

async function test() {
    console.log('Top 5 countries by area:');
    console.log(await getTopCountriesByArea(5));
    
    console.log('Top 5 countries by population:');
    console.log(await getTopCountriesByPopulation(5));
    
    console.log('Countries where Portuguese is spoken:');
    console.log(await getCountriesByLanguage('Portuguese'));
    
    console.log('Countries that accept USD:');
    console.log(await getCountriesByCurrency('USD'));
    
    console.log('Landlocked countries:');
    console.log(await getLandlockedCountries());
    
    console.log('Country with the highest Gini index:');
    console.log(await getCountryWithHighestGini());
    
    console.log('Countries in Middle Africa:');
    console.log(await getCountriesBySubregion('Middle Africa'));
    
    console.log('Countries in timezone UTC+01:00:');
    console.log(await getCountriesByTimezone('UTC+01:00'));
}

test();
