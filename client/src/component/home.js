import React, { useState } from "react";
import "./Home.css"; // For custom styles
import { v4 as uuid } from "uuid";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUserName] = useState("");
  const navigate = useNavigate();
  const gennerateRoomId = (e) => {
    e.preventDefault();
    const newRoomId = uuid();
    setRoomId(newRoomId);
    toast.success("Room ID is generated");
  };
  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Please enter both room id and username");
    } else {
      navigate(`/editor/${roomId}`, {
        state: { username },
      });
      toast.success("You have joined the room");
    }
  };

  return (
    <div className="home-container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 rounded  glass-card">
        <div className="text-center">
          <img
            className="img-fluid mb-3"
            src="/images/CODECAST.png"
            alt="logo"
            style={{ maxWidth: "120px" }}
          />
          <h2 className="mb-3 text-white">
            Welcome to <span className="text-success">CodeSync</span>
          </h2>
          <p className="text-light mb-4">Collaborate. Code. Conquer.</p>
        </div>

        <div className="form-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>
        <div className="form-group mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Enter Your Username"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <button
          className="btn btn-success btn-lg w-100 mb-3"
          onClick={joinRoom}
        >
          Join Room
        </button>
        <p className="text-center text-white">
          Don't have a Room ID?{" "}
          <span
            className="text-success generate-link"
            onClick={gennerateRoomId}
          >
            Generate Room ID
          </span>
        </p>
      </div>
    </div>
  );
}

export default Home;
