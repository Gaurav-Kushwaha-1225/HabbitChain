import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart } from 'chart.js/auto';
import Button from "./Button";
import { addHabit, markHabitComplete, getHabits } from '../contractInteractions';

const Dashboard = ({ wallet, client, isConnected, connectWallet }) => {
  // Initial temporary data for habits
  const initialHabits = [
    { name: "Exercise", frequency: "daily", streak: [1, 2, 2, 3, 2, 1, 1] },
    { name: "Meditation", frequency: "daily", streak: [0, 1, 1, 2, 1, 2, 2] },
    { name: "Reading", frequency: "daily", streak: [3, 3, 2, 1, 2, 3, 3] }
  ];

  const [habits, setHabits] = useState(initialHabits);  // Set initial temp data
  const [habitName, setHabitName] = useState("");
  const [habitFrequency, setHabitFrequency] = useState("daily");
  const [habitGoal, setHabitGoal] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected) {
      fetchHabits();
    } else {
      setLoading(false);
    }
  }, [isConnected, wallet, client]);

  const fetchHabits = async () => {
    if (wallet && client) {
      try {
        setLoading(true);
        const userAddress = await wallet.account();
        const userHabits = await getHabits(client, userAddress);
        console.log(userAddress)
        if (userHabits.length === 0) {
          // Keep the initial temporary habits if no real data is available
          setHabits(initialHabits);
        } else {
          setHabits(userHabits);  // Update with real data when available
        }
      } catch (error) {
        console.error("Error fetching habits:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const habitProgressData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Habit Progress",
        data: habits.map(habit => habit.streak),
        fill: false,
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    // ... (existing chartOptions)
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const updateHabit = async (id) => {
    if (wallet && client) {
      try {
        await markHabitComplete(wallet, client, id);
        fetchHabits();
      } catch (error) {
        console.error("Error marking habit complete:", error);
      }
    }
  };

  const addNewHabit = async (e) => {
    e.preventDefault();
    if (wallet && client) {
      try {
        console.log(wallet)
        await addHabit(wallet, client, habitName, habitFrequency, habitGoal);
        setHabitName("");
        setHabitGoal("");
        fetchHabits();
      } catch (error) {
        console.error("Error adding habit:", error);
      }
    }
  };

  const filterProgress = (range) => {
    console.log(`Filter progress by: ${range}`);
  };

  if (!isConnected) {
    console.log(wallet)
    return (
      <div className="dashboard bg-n-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="mb-4">Please connect your wallet to use the habit tracker.</p>
          <Button onClick={connectWallet} className="text-white bg-black px-6 py-3 rounded-md border border-white hover:bg-white hover:text-black transition-colors duration-300">
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard bg-n-8 min-h-screen">
      <div className="container mx-auto px-4 py-24">
        {/* Overview Section */}
        <section className="overview-section bg-white shadow-md p-6 rounded-lg mb-6">
          <h2 className="text-2xl text-black font-bold mb-4">Your Habit Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {habits.map((habit, index) => (
              <div key={index} className="habit-card bg-white shadow-lg p-4 rounded-lg border border-black hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-semibold text-black">{habit.name}</h3>
                <p className="text-black">Current Streak: <span className="font-bold">{habit.streak.join(", ")} days</span></p>
                <Button className="mt-4 text-white bg-black px-6 py-3 rounded-md border border-white hover:bg-white hover:border-1 hover:text-black hover:border-black transition-all duration-300" onClick={() => updateHabit(index)}>
                  Mark as Done
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Update or Add New Habit Section */}
        <section className="update-habit-section bg-white shadow-md p-6 rounded-lg mb-6">
          <h2 className="text-2xl text-black font-bold mb-4">Update or Add New Habit</h2>
          <form className="space-y-4" onSubmit={addHabit}>
            <div>
              <label htmlFor="habitName" className="block text-sm font-medium">Habit Name</label>
              <input
                type="text"
                id="habitName"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="habitFrequency" className="block text-sm font-medium">Frequency</label>
              <select
                id="habitFrequency"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                value={habitFrequency}
                onChange={(e) => setHabitFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label htmlFor="habitGoal" className="block text-sm font-medium">Goal</label>
              <input
                type="text"
                id="habitGoal"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="e.g. 30 minutes of exercise"
                value={habitGoal}
                onChange={(e) => setHabitGoal(e.target.value)}
                required
              />
            </div>
            <Button className="text-white bg-black px-4 py-2 rounded-md border border-gray-700 hover:bg-white hover:text-black hover:border-black transition-colors duration-300 shadow-sm" type="submit">
              Save Habit
            </Button>
          </form>
        </section>

        {/* Progress Section */}
        <section className="progress-section bg-white shadow-md p-6 rounded-lg mb-6">
          <h2 className="text-2xl text-black font-bold mb-4">Habit Progress</h2>
          <div className="chart-container border border-gray-300 rounded-lg overflow-hidden shadow-lg">
            <Line
              data={habitProgressData}
              options={{
                ...chartOptions,
                maintainAspectRatio: false,
                elements: {
                  line: {
                    tension: 0.4,
                    borderWidth: 2,
                  },
                  point: {
                    radius: 5,
                  },
                },
                plugins: {
                  legend: {
                    labels: {
                      color: 'black',
                    },
                  },
                },
              }}
              height={250}
            />
          </div>
          <div className="filter-options mt-4">
            <Button className="mr-4 text-white bg-black px-4 py-2 rounded-md border border-gray-700 hover:bg-white hover:text-black hover:border-black transition-colors duration-300 shadow-sm" onClick={() => filterProgress("week")}>
              Last Week
            </Button>
            <Button className="text-white bg-black px-4 py-2 rounded-md border border-gray-700 hover:bg-white hover:text-black hover:border-black transition-colors duration-300 shadow-sm" onClick={() => filterProgress("month")}>
              Last Month
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
