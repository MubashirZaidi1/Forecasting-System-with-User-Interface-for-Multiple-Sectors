import React, { useState } from 'react';
import './App.css';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

function App() {
  //states
  const [dataset, setDataset] = useState('');
  const [model, setModel] = useState('');
  const [forecastData, setForecastData] = useState([]);
  const [forecastLength, setForecastLength] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [graphType, setGraphType] = useState(''); // State to keep track of selected graph type
  const graphTypeOptions = [
    { label: "Select Graph Type", value: "" },
    { label: "Original Data Graph", value: "original" },
    { label: "Prediction Data Graph", value: "prediction" },
    { label: "Combined Data Graph", value: "combined" }
  ];    

  const handleDatasetChange = (event) => {
    setDataset(event.target.value);
  };

  const handleModelChange = (event) => {
    setModel(event.target.value);
  };

  const handleForecastLengthChange = (event) => {
    setForecastLength(event.target.value);
  };

  const handleDateChange = (event, setDate) => {
    setDate(event.target.value);
  };

  // Handle change for graph type selection
  const handleGraphTypeChange = (event) => {
    setGraphType(event.target.value);
    setForecastData([]); // Clear existing data when graph type changes
  };


  const handleFetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dataset: dataset, start_date: startDate, end_date: endDate })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok (handleFetchData Function)');
      }
      const data = await response.json();
      setForecastData(data);  // Assuming data is the array of objects {Datetime, AEP_MW}
      console.log(data);
    } catch (error) {
      setError('Failed to fetch data: ' + error.message);
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  
  const handleForecast = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model: model, dataset: dataset, length: forecastLength, start_date: startDate, end_date: endDate })
      });
      if (!response.ok){
        throw new Error('Network repsonse was not ok');
      }
      const data = await response.json();
      setForecastData(data);
      console.log(data);
    } catch (error) {
      setError('Failed to fetch forecast: ' + error.message);
      console.error('Error fetching forecast:', error);
    } finally{
      setLoading(false);
    }
  };

  const handleCombinedForecast = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/combinedForecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model: model, dataset: dataset, length: forecastLength, start_date: startDate, end_date: endDate })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok from handleCombinedForecast');
      }
      const data = await response.json();
      setForecastData(data);  // Assuming data is the array of objects {Datetime, AEP_MW}
      console.log(data);
    } catch (error) {
      setError('Failed to fetch forecast: ' + error.message);
      console.error('Error fetching forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render input fields based on the selected graph type
  const renderInputFields = () => {
    switch (graphType) {
      case "original":
        return (
          <div>
            <input type="date" value={startDate} onChange={(e) => handleDateChange(e, setStartDate)} />
            <input type="date" value={endDate} onChange={(e) => handleDateChange(e, setEndDate)} />
            <button onClick={handleFetchData}>Show Data</button>
          </div>
        );
      case "prediction":
        return (
          <div>
            <input type="number" value={forecastLength} onChange={handleForecastLengthChange} />
            <button onClick={handleForecast}>Show Forecast</button>
          </div>
        );
      case "combined":
        return (
          <div>
            <input type="number" value={forecastLength} onChange={handleForecastLengthChange} />
            <input type="date" value={startDate} onChange={(e) => handleDateChange(e, setStartDate)} />
            <input type="date" value={endDate} onChange={(e) => handleDateChange(e, setEndDate)} />
            <button onClick={handleCombinedForecast}>Show Combined Forecast</button>
          </div>
        );
      default:
        return null; // No inputs if no graph type is selected
    }
  };
 
  // const data = {
  //   labels: forecastData.map((_, index) => `Time ${index}`), // Placeholder labels
  //   datasets: [
  //     {
  //       label: 'Forecast',
  //       data: forecastData,
  //       fill: false,
  //       backgroundColor: 'rgb(75,192,192)',
  //       borderColor: 'rgba(75,192,192,0.2)',
  //     },
  //   ],
  // };
  const measurementKey = `${dataset.split('_')[0]}_MW`;

  const data = {
      labels: forecastData.map(item => item.Datetime),
      datasets: [
        {
          label: `${dataset.split('_')[0]} MW`, // Dynamic label based on selected dataset
          data: forecastData.map(item => item[measurementKey]), // Dynamic data key
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
  };
  

  return (
    <div className="App">
      <header className="App-header">
        <h1>Forecasting System</h1>
        
        <div>
          <label>
            Select Graph Type:
            <select value={graphType} onChange={handleGraphTypeChange}>
              {graphTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
  
        {graphType === 'original' && (
          <div>
            <label>
              Select Dataset:
              <select value={dataset} onChange={handleDatasetChange}>
                <option value="">Select a dataset</option>
                <option value="AEP_Forecast">AEP Hourly</option>
                <option value="COMED_Forecast">COMED Hourly</option>
                <option value="DAYTON_Forecast">DAYTON Hourly</option>
                <option value="DEOK_Forecast">DEOK Hourly</option>
                <option value="DOM_Forecast">DOM Hourly</option>
                {/* <option value="DUQ_Forecast">DUQ Hourly</option> */}
                <option value="EKPC_Forecast">EKPC Hourly</option>
                {/* <option value="est_hourly.parquet">EST Hourly</option> */}
                <option value="FE_Forecast">FE Hourly</option>
                <option value="NI_Forecast">NI Hourly</option>
                <option value="PJME_Forecast">PJME Hourly</option>
                <option value="PJM_Forecast">PJM Hourly Est</option>
                {/* <option value="PJM_LOAD_Forecast">PJM LOAD Hourly</option> */}
                <option value="PJMW_Forecast">PJMW Hourly</option>
              </select>
            </label>
            <input type="date" value={startDate} onChange={(e) => handleDateChange(e, setStartDate)} />
            <input type="date" value={endDate} onChange={(e) => handleDateChange(e, setEndDate)} />
            <button onClick={handleFetchData}>Show Data</button>
          </div>
        )}
  
        {graphType === 'prediction' && (
          <div>
            <label>
              Select Model:
              <select value={model} onChange={handleModelChange}>
                <option value="">Select a model</option>
                <option value="ARIMA_prediction">ARIMA</option>
                <option value="ANN_prediction">ANN</option>
                <option value="SARIMAX_prediction">SARIMA</option>
                <option value="ETS_prediction">ETS</option>
                <option value="Prophet_prediction">Prophet</option>
                <option value="SVR_prediction">SVR</option>
                <option value="LSTM_prediction">LSTM</option>
                <option value="Hybrid_prediction">Hybrid Model (ARIMA+ANN)</option>
              </select>
            </label>
            <input type="number" value={forecastLength} onChange={handleForecastLengthChange} />
            <button onClick={handleForecast}>Show Forecast</button>
          </div>
        )}
  
        {graphType === 'combined' && (
          <div>
            <input type="date" value={startDate} onChange={(e) => handleDateChange(e, setStartDate)} />
            <input type="date" value={endDate} onChange={(e) => handleDateChange(e, setEndDate)} />
            <input type="number" value={forecastLength} onChange={handleForecastLengthChange} />
            <button onClick={handleCombinedForecast}>Show Combined Forecast</button>
          </div>
        )}
  
        <Line data={data}></Line>
      </header>
    </div>
  );
  

}

export default App;
