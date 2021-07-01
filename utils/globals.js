const Discord = require("discord.js");

const ChartJSNode = require('chartjs-node-canvas');
const Chart = require('chart.js');

const defaultChart = new ChartJSNode.ChartJSNodeCanvas({ width: 800, height: 600 });

Chart.defaults.font.size = 18;
Chart.defaults.borderColor = "rgba(255, 255, 255, 0.4)";
Chart.defaults.color = "rgba(255, 255, 255, 1)"

module.exports = {
    commands: new Discord.Collection(),
    categories: new Discord.Collection(),
    /** @param {Chart.ChartConfiguration} options */
    defaultChartRenderer: (options, chartOpts = {}) => defaultChart.renderToBuffer({ 
        options: {
            scales: {
                y: {
                    suggestedMin: 0,

                    ticks: {
                        beginAtZero: false,
                        precision: 0,
                        stepSize: 1,
                    }
                },
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgb(239, 141, 50)',
                        font: {
                            size: 20
                        }
                    }
                },
                tooltip: {
                    enabled: false
                }
            },

            ...chartOpts
        },
        ...options 
    })
}

// CHARTJS v2 CONFIGURATION
// defaultChartRenderer: (options) => defaultChart.renderToBuffer({ 
//     options: {
//         scales: {
//             yAxes: {
//                 ticks: {
//                     beginAtZero: false,
//                     precision: 0,
//                     stepSize: 1,

//                     fontColor: 'rgba(255, 255, 255, 1)',
//                     fontSize: 18
//                 },
//                 gridLines: {
//                     zeroLineColor: "rgba(255, 255, 255, 0.8)",
//                     color: "rgba(255, 255, 255, 0.4)"
//                 }
//             },

//             xAxes: {
//                 ticks: {
//                     fontColor: 'white',
//                     fontSize: 18
//                 },
//                 gridLines: {
//                     zeroLineColor: "rgba(255, 255, 255, 0.8)",
//                     color: "rgba(255, 255, 255, 0.4)"
//                 }
//             }
//         },
//         legend: {
//             //display: false,
//             labels: {
//                 fontColor: 'rgb(239, 141, 50)',
//                 fontSize: 20
//             }
//         },
//         tooltips: {
//             enabled: false
//         }
//     },
//     ...options 
// })