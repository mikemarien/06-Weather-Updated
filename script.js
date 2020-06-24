$(document).ready(function() {
  $("#search-button").on("click", function() {
      // create and store variable "search-value"
      var searchValue = $("#search-value").val();
    // clear input box
    $("#search-value").val("");
    searchWeather(searchValue);
  });
  // create an "on-click" event attached to the "history" class
  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

    function searchWeather(searchValue) {
      // run ajax to call the openWeatherMap API
      $.ajax({
        type: "GET",
        // place api url with api key
        url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&APPID=2fc59b62a8b19ad6b1e14045a8ed1c2b&units=metric",
        dataType: "json",
        success: function(data) {
          // create history link for this search
          // Keep search history populating with last search name push to search value box
          if (history.indexOf(searchValue) === -1) {
            history.push(searchValue);
            // store in local storage of the page and stringify
            window.localStorage.setItem("history", JSON.stringify(history));
            // add it to the row
            make(searchValue);
          }
          
          // clear any old content
          $("#today").empty();
  
        // create html content for current weather
        // populate h3 tag with the name of the city that we searched for
          var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
          var card = $("<div>").addClass("card");
          var wind = $("<p>").addClass("card-text")
          var humid = $("<p>").addClass("card-text")
          var temp = $("<p>").addClass("card-text")
          var sunrise = $("<p>").addClass("card-text")
          var sunset = $("<p>").addClass("card-text")

          var cardBody = $("<div>").addClass("card-body");
          var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
  
          // merge and add to page
          // append the image tag to the card-title class
          title.append(img);
          // append the new elements to the cardBody div
          cardBody.append(title, temp, humid, wind, sunrise, sunset);
          // append the cardBody div to the card div
          card.append(cardBody);
          // append the card div to the "today" ID
          $("#today").append(card);
  
          // call follow-up api endpoints
        //  calling these next API functions will add the UV index and 5-day-forecast to page
          getForecast(searchValue);
          getUVIndex(data.coord.lat, data.coord.lon);
        }
      });
    }



    // Create a function for the forcast api
    function getForecast(searchValue) {
      $.ajax({
        type: "GET",
        // add the url of the forcast api with api key
        url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=2fc59b62a8b19ad6b1e14045a8ed1c2b&units=metric",
        dataType: "json",
        success: function(data) {
          // overwrite any existing content with title and empty row
          $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
  
          // loop over all forecasts (by 3-hour increments)
          for (var i = 0; i < data.list.length; i++) {
            // only look at forecasts around 3:00pm
            if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
              // create html elements for a bootstrap card
              var col = $("<div>").addClass("col-md-2");
              var card = $("<div>").addClass("card bg-primary text-white");
              var body = $("<div>").addClass("card-body p-2");
              // Create a varible to use JQuery to add the text of the data to the string
              var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
              // Create a varible to render the correct image from the url
              var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
              // Create variable to render temperature
              var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °C");
              // Create variable to render humidity
              var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
              // Create variable to render sunrise
              var p3 = $("<p>").addClass("card-text").text("Sunrise: " + data.list[i].main.sunrise) + "time";
              // Create variable to render sunset
              var p4 = $("<p>").addClass("card-text").text("Sunset: " + data.list[i].main.sunset) + "time";
              var p5 = $("<p>").addClass("card-text").text("Pressure: " + data.list[i].main.presure) + "time";
     
  
              // merge together and put on page
              col.append(card.append(body.append(title, img, p1, p2, p3, p4, p5)));
              $("#forecast .row").append(col);
            }
          }
        }
      });
    }

    // this is the function that will generate the UV index on the page
    function getUVIndex(lat, lon) {
      $.ajax({
        type: "GET",
        url: "http://api.openweathermap.org/data/2.5/uvi?appid=2fc59b62a8b19ad6b1e14045a8ed1c2b=" + lat + "&lon=" + lon,
        dataType: "json",
        success: function(data) {
        // creates a new paragraph starting with "UV Index: "
          var uv = $("<p>").text("UV Index: ");
        // populates the UV button with the data/value generated by the search input (i.e.: the UV index will be paired with Berlin if the user searched for Berlin's weather)  
          var btn = $("<span>").addClass("btn btn-sm").text(data.value);
          
          // change color depending on uv value
          if (data.value < 3) {
            btn.addClass("btn-success");
          }
          else if (data.value < 7) {
            btn.addClass("btn-warning");
          }
          else {
            btn.addClass("btn-danger");
          }
        // append UV btn in the card-body
          $("#today .card-body").append(uv.append(btn));
        }
      });
    }

      // use a function to dynamically create a row that contains the cities in the search history
    function makeRow(text) {
    // create a list and set it to the text of what gets clicked
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    // append the new list to the history class 
    $(".history").append(li);
    }
  
    // get current history, if any
    var history = JSON.parse(window.localStorage.getItem("history")) || [];
    
    if (history.length > 0) {
      searchWeather(history[history.length-1]);
    }
    // adds a history log of all the previously searched cities to the left side of the page (row for each)
    for (var i = 0; i < history.length; i++) {
      makeRow(history[i]);
    }
  });
































