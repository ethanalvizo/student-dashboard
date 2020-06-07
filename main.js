// Radar Chart
var ctxR = document.getElementById("radarChart").getContext('2d');
var myRadarChart = new Chart(ctxR, {
    type: 'radar',
    data: {
        labels: ["Professional", "Fitness", "Family Time", "Personal Time", "Spirituality", "Guitar"],
        datasets: [
            {
                label: "This Week",
                data: [4, 2, 3, 4, 4, 5],
                backgroundColor: [
                    'rgba(105, 0, 132, .2)',
                ],
                borderColor: [
                    'rgba(200, 99, 132, .7)',
                ],
                borderWidth: 2
            },
            {
                label: "Last Week",
                data: [2.5, 2.5, 3, 3.5, 1, 4],
                backgroundColor: [
                'rgba(0, 250, 220, .2)',
                ],
                borderColor: [
                    'rgba(0, 213, 132, .7)',
                ],
                borderWidth: 2
            }
        ]
    },
    options: {
        responsive: true,
        scale: {
            angleLines: {
                display: false
            },
            ticks: {
                beginAtZero: true,
                stepSize: 1

            }
        }
        
        
    }
});



//sliders
var slider = document.getElementById("professionalRange");
var output = document.getElementById("professionalValue");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
}


//sliders
var slider2 = document.getElementById("fitnessRange");
var output2 = document.getElementById("fitnessValue");
output2.innerHTML = slider2.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider2.oninput = function() {
  output2.innerHTML = this.value;
}

//sliders
var slider3 = document.getElementById("familyTimeRange");
var output3 = document.getElementById("familyTimeValue");
output3.innerHTML = slider3.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider3.oninput = function() {
  output3.innerHTML = this.value;
}

//sliders
var slider4 = document.getElementById("personalTimeRange");
var output4 = document.getElementById("personalTimeValue");
output4.innerHTML = slider4.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider4.oninput = function() {
  output4.innerHTML = this.value;
}

//sliders
var slider5 = document.getElementById("spiritualityRange");
var output5 = document.getElementById("spiritualityValue");
output5.innerHTML = slider5.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider5.oninput = function() {
  output5.innerHTML = this.value;
}

//sliders
var slider6 = document.getElementById("guitarRange");
var output6 = document.getElementById("guitarValue");
output6.innerHTML = slider6.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider6.oninput = function() {
  output6.innerHTML = this.value;
}


// Smiley Face Scale
$('#smileys input').on('click', function() {
	$('#result').html($(this).val());
});

// Pop-overs Enabled
$(function () {
    $('[data-toggle="popover"]').popover()
  })