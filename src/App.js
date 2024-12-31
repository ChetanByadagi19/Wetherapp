import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Card,
  Grid,
  Typography,
  Container,
  AppBar,
  Toolbar,
  Box,
  Snackbar,
  CircularProgress
} from "@mui/material";
import { useCookies } from "react-cookie";
import { CSSTransition, TransitionGroup } from "react-transition-group"; // Import for transitions

const fetchWeatherData = async (city, unit) => {
  const API_KEY = "6b0731e88a8f671d3a32faa5e8a27476";
  const URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=${unit}`;

  try {
    const response = await axios.get(URL);
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("City not found or API error");
  }
};

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cookies, setCookie] = useCookies(["unit"]);
  const [unit, setUnit] = useState(cookies.unit || "metric");
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
  }, []);

  // Search for weather data by city
  const handleSearch = async () => {
    if (!city.trim()) {
      setErrorMessage("Please enter a city name");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchWeatherData(city, unit);
      setWeather(data);
      setErrorMessage(""); // Clear error message if data is fetched successfully
    } catch (error) {
      setErrorMessage("City not found. Please try again.");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Toggle unit between Celsius (metric) and Fahrenheit (imperial)
  const toggleUnit = () => {
    const newUnit = unit === "metric" ? "imperial" : "metric";
    setUnit(newUnit);
    setCookie("unit", newUnit, { path: "/" });
  };

  // Add a city to the favorites list
  const handleAddToFavorites = () => {
    if (weather && !favorites.some((fav) => fav.name === weather.name)) {
      const updatedFavorites = [...favorites, weather];
      setFavorites(updatedFavorites);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    }
  };

  // Remove a city from the favorites list
  const handleRemoveFromFavorites = (cityName) => {
    const updatedFavorites = favorites.filter((fav) => fav.name !== cityName);
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  // Clear all favorite cities from the list and localStorage
  const handleClearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem("favorites");
  };

  return (
    <Container maxWidth="lg">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Weather Dashboard</Typography>
        </Toolbar>
      </AppBar>

      <Box mt={4}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ padding: 2 }}>
              <TextField
                fullWidth
                label="Enter city"
                variant="outlined"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                fullWidth
                sx={{ mb: 2 }}
                disabled={loading} // Disable search button during loading
              >
                Search
              </Button>

              {loading ? (
                <CircularProgress />
              ) : weather ? (
                <div>
                  <Typography variant="h6" gutterBottom>
                    {weather.name} ({weather.sys.country})
                  </Typography>
                  <Typography variant="body1">
                    Temperature: {weather.main.temp}° {unit === "metric" ? "C" : "F"}
                  </Typography>
                  <Button onClick={toggleUnit} variant="outlined" fullWidth>
                    Switch to {unit === "metric" ? "Fahrenheit" : "Celsius"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleAddToFavorites}
                    fullWidth
                    sx={{ mt: 3 }}
                  >
                    Add to Favorites
                  </Button>
                </div>
              ) : null}
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Favorites section */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Favorites
        </Typography>
        <Button
          onClick={handleClearFavorites}
          variant="outlined"
          color="error"
          sx={{ mb: 2 }}
        >
          Clear All
        </Button>

        <TransitionGroup>
          <Grid container spacing={2}>
            {favorites.map((fav) => (
              <CSSTransition key={fav.name} timeout={300} classNames="favorite-item">
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ padding: 2 }}>
                    <Typography variant="h6">{fav.name}</Typography>
                    <Typography variant="body1">
                      {fav.main.temp}°{unit === "metric" ? "C" : "F"}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleRemoveFromFavorites(fav.name)}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Remove
                    </Button>
                  </Card>
                </Grid>
              </CSSTransition>
            ))}
          </Grid>
        </TransitionGroup>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={errorMessage}
      />
    </Container>
  );
}

export default App;
