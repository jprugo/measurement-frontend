function pintarTabla(tableBody, measureType) {
    fileName = `${measureType}-`;
    $("#tabla .table tbody").html(tableBody);
}

async function pintarGrafico(pointsObject, title, suffix) {
    console.log(`suffix: ${suffix}`);
    var _widthGraph = document.getElementById("graph").clientWidth;
    var _heightGraph = document.getElementById("graph").clientHeight;

    var colors = ["#FF6347", "#00CED1", "#FFD700", "#800080", "#32CD32"];
    var data = [];
    var idx = 0;

    for (let key in pointsObject) {
        data.push({
            type: "line",
            name: key,
            lineColor: colors[idx % colors.length],
            lineThickness: 3,
            dataPoints: pointsObject[key].datapoints
        });
        idx++;
    }

    var options = {
        width: _widthGraph, 
        height: _heightGraph,
        theme: "light2",
        exportEnabled: true,
        interactivityEnabled: true,
        animationEnabled: true,
        showInLegend: true,
        title: { text: title },
        axisY: {
            gridColor: "white",
            labelFontSize: 16,
            labelFontColor: "black",
            title: suffix,
            titleFontSize: 16,
        },
        axisX: {
            gridColor: "white",
            valueFormatString: "HH:mm:ss",
            labelFontSize: 16,
            labelFontColor: "black",
            title: "Timestamp",
            titleFontSize: 16,
        },
        toolTip: {
            shared: true
        },
        data: data
    };

    $("#graph").CanvasJSChart(options);
}

function agregarDatosAlGrafico(newDataPoints) {
    var grafico = $("#graph").CanvasJSChart();
    grafico.options.data[0].dataPoints = grafico.options.data[0].dataPoints.concat(newDataPoints);
    grafico.render();
}

// BACKEND
async function cargarDatos(data, title, suffix) {
    const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== null && value !== undefined)
    );

    const params = new URLSearchParams(filteredData).toString();
    const url = `http://localhost:8000/measurement?${params}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        var tableBody = '';
        var datos = data.result;

        for (let i in datos) {
            let cuenta = parseInt(i) + 1;

            tableBody += '<tr>' +
                '<th scope="row">' + cuenta + '</th>' +
                '<td>' + datos[i].created_at + '</td>' +
                '<td>' + datos[i].value + '</td>' +
                '<td>' + datos[i].detail + '</td>' +
                '</tr>';
        }
        pintarTabla(tableBody, title);

        var dataTypes = {};

        datos.forEach(function (e) {
            let key = (e.detail === "" || e.detail === null) ? 'data' : e.detail;
            if (!dataTypes[key]) {
                dataTypes[key] = { datapoints: [] };
            }
            dataTypes[key].datapoints.push({ y: e.value, x: new Date(e.created_at) });
        });

        console.log(dataTypes);
        pintarGrafico(dataTypes, title, suffix);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// UTILS 
const subMinutesToDate = (date, n) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - n);
    return d;
};

const subHoursToDate = (date, n) => {
    const d = new Date(date);
    d.setHours(d.getHours() - n);
    return d;
};

async function handleSearch(measureType, detailName) {
    fecha1Value = document.getElementById("date1").value
    fecha1 = fecha1Value.toString().replace("T", " ");

    fecha2Value = document.getElementById("date2").value
    fecha2 = fecha2Value.toString().replace("T", " ");

    document.getElementById("selectedRange").innerHTML = fecha1 + " - " + fecha2;

    detail = detailName === null ? null : document.getElementById(detailName).value;

    data = {
        measure_type: measureType,
        start_date: formatearFecha(new Date(fecha1Value)),
        end_date: formatearFecha(new Date(fecha2Value)),
        detail: detail
    }

    await cargarDatos(data, measureType, await getUnitsForMeasureType(measureType));
}

function formatearFecha(fecha) {
    var año = fecha.getFullYear();
    var mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
    var dia = ('0' + fecha.getDate()).slice(-2);
    var hora = ('0' + fecha.getHours()).slice(-2);
    var minutos = ('0' + fecha.getMinutes()).slice(-2);
    var segundos = ('0' + fecha.getSeconds()).slice(-2);

    fecha_formateada = año + '-' + mes + '-' + dia + 'T' + hora + ':' + minutos + ':' + segundos;
    console.log("Fecha formateada: " + fecha_formateada);
    return fecha_formateada;
}

// HTML
function cargarContenido(url, identifier, callback) {

    var request = $.ajax({
        method: "GET",
        url: url
    });

    request.done(function (content) {
        $(identifier).html(content);

        if (typeof callback === 'function') {
            callback();
        }
    });

    request.fail(function (jqXHR, textStatus) {
        $(identifier).html("Request failed: " + textStatus);
    });
}

// Response
function getValue(name, data) {
    const result = data.find(d => d.name === name);
    return result ? result.value : null;
}

// HANDLERS
async function manejarRelativeButton(interval, intervalType, measureType, detailName) {

    endDate = new Date();
    var startDate = null;

    if (intervalType === 'M') {
        startDate = subMinutesToDate(endDate, interval);
    } else {
        startDate = subHoursToDate(endDate, interval);
    }

    detail = detailName === null ? null : document.getElementById(detailName).value;

    data = {
        measure_type: measureType,
        start_date: formatearFecha(startDate),
        end_date: formatearFecha(endDate),
        detail: detail
    }

    await cargarDatos(data, measureType, await getUnitsForMeasureType(measureType));
}

async function fetchBatteryLevel() {
    try {
        const response = await fetch('http://localhost:8000/measurement/last', {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const batteryMeasurement = data.result.find(measure => measure.measure_type === 'BATTERY');

        if (batteryMeasurement) {
            updateBatteryLevel(batteryMeasurement.value);
        } else {
            console.log('No battery measurement found');
        }
    } catch (error) {
        console.error('Error fetching battery level:', error);
    }
}

function updateBatteryLevel(level) {
    const batteryElement = document.getElementById('battery');
    batteryElement.textContent = level + '%';
}

async function getUnitsForMeasureType(measureType) {
    try {
        const response = await fetch(`http://localhost:8000/measurement/sensor?measure_type=${measureType}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const result = data.result;

        if (result && result.measurement_spec) {
            const measure = result.measurement_spec.find(m => m.measure_type === measureType);
            if (measure) {
                return measure.unit;
            } else {
                console.log(`No se encontró la unidad para el tipo de medida: ${measureType}`);
                return null;
            }
        } else {
            console.log("No se encontraron especificaciones de medida.");
            return null;
        }
    } catch (error) {
        console.error("Error al recuperar la unidad del sensor:", error);
        return null;
    }
}
