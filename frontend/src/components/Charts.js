import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Charts = ({ songs }) => {
  // Scatter chart for danceability
  const scatterData = {
    datasets: [
      {
        label: "Songs by Danceability",
        data: songs.map((song, index) => ({
          x: index,
          y: song.danceability,
        })),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        pointRadius: 4,
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Danceability Scatter Plot",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Song Index",
        },
      },
      y: {
        title: {
          display: true,
          text: "Danceability",
        },
        min: 0,
        max: 1,
      },
    },
  };

  // Histogram for song duration
  const durationBins = [0, 120, 180, 240, 300, 360, 420];
  const durationCounts = new Array(durationBins.length - 1).fill(0);

  songs.forEach((song) => {
    const duration = song.duration_s || song.duration_ms / 1000;
    for (let i = 0; i < durationBins.length - 1; i++) {
      if (duration >= durationBins[i] && duration < durationBins[i + 1]) {
        durationCounts[i]++;
        break;
      }
    }
  });

  const histogramData = {
    labels: durationBins
      .slice(0, -1)
      .map((bin, i) => `${bin}-${durationBins[i + 1]}s`),
    datasets: [
      {
        label: "Number of Songs",
        data: durationCounts,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const histogramOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Song Duration Distribution",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Songs",
        },
      },
      x: {
        title: {
          display: true,
          text: "Duration (seconds)",
        },
      },
    },
  };

  // Bar chart for acousticness ranges
  const acousticnessBins = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const acousticnessCounts = new Array(acousticnessBins.length - 1).fill(0);

  songs.forEach((song) => {
    for (let i = 0; i < acousticnessBins.length - 1; i++) {
      if (
        song.acousticness >= acousticnessBins[i] &&
        song.acousticness < acousticnessBins[i + 1]
      ) {
        acousticnessCounts[i]++;
        break;
      }
    }
  });

  const acousticnessData = {
    labels: acousticnessBins
      .slice(0, -1)
      .map((bin, i) => `${bin}-${acousticnessBins[i + 1]}`),
    datasets: [
      {
        label: "Number of Songs",
        data: acousticnessCounts,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Bar chart for tempo ranges
  const tempoBins = [60, 90, 120, 150, 180, 210, 300];
  const tempoCounts = new Array(tempoBins.length - 1).fill(0);

  songs.forEach((song) => {
    for (let i = 0; i < tempoBins.length - 1; i++) {
      if (song.tempo >= tempoBins[i] && song.tempo < tempoBins[i + 1]) {
        tempoCounts[i]++;
        break;
      }
    }
  });

  const tempoData = {
    labels: tempoBins
      .slice(0, -1)
      .map((bin, i) => `${bin}-${tempoBins[i + 1]} BPM`),
    datasets: [
      {
        label: "Number of Songs",
        data: tempoCounts,
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Songs",
        },
      },
    },
  };

  return (
    <div className="charts-container">
      <div className="chart-container">
        <h3>Danceability Scatter Plot</h3>
        <Scatter data={scatterData} options={scatterOptions} />
      </div>

      <div className="chart-container">
        <h3>Duration Histogram</h3>
        <Bar data={histogramData} options={histogramOptions} />
      </div>

      <div className="chart-container">
        <h3>Acousticness Distribution</h3>
        <Bar
          data={acousticnessData}
          options={{
            ...barOptions,
            plugins: {
              ...barOptions.plugins,
              title: { display: true, text: "Acousticness Distribution" },
            },
          }}
        />
      </div>

      <div className="chart-container">
        <h3>Tempo Distribution</h3>
        <Bar
          data={tempoData}
          options={{
            ...barOptions,
            plugins: {
              ...barOptions.plugins,
              title: { display: true, text: "Tempo Distribution" },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Charts;
