import React, { useEffect, useState, useRef } from "react";
import "./Home.css";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../socket";
import { useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useNavigate, Navigate } from "react-router-dom";
function EditorPage() {
  const socketRef = useRef(null);
  const location = useLocation();
  const codeRef = useRef("");

  const navigate = useNavigate();
  const { roomId } = useParams();
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect", () => {
        socketRef.current.emit("join", {
          roomId,
          username: location.state?.username,
        });
      });
      socketRef.current.on("connect_error", (err) => {
        console.log(err);
        toast.error("Socket connection failed");
        navigate("/");
      });
      socketRef.current.on("connect_failed", (err) => {
        console.log(err);
      });
      socketRef.current.on("joined", ({ clients, username, socketId }) => {
        if (username !== location.state.username) {
          toast.success(`User ${username} joined the room`);
        }
        setClient(clients);

        // Only send sync-code if *I* am the new user (my socketId === socketRef.current.id)
        if (socketRef.current.id === socketId) {
          // I am the new user, ask for code from others
          socketRef.current.emit("sync-code", {
            socketId: socketRef.current.id,
            roomId,
          });
        }
      });
      socketRef.current.on("disconnected", ({ socketId, username }) => {
        toast.success(`${username} left`);
        setClient((prev) => {
          return prev.filter((client) => client.socketId != socketId);
        });
      });
    };
    init();
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off("joined");
      socketRef.current.off("disconnected");
    };
  }, []);
  const [clients, setClient] = useState([]);
  if (!location.state) {
    return <Navigate to="/" />;
  }
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard");
    } catch (err) {
      toast.error("Unabble to copy room ID");
    }
  };
  const leaveRoom = () => {
    navigate("/");
  };
  return (
    <div>
      <div className="container-fluid vh-100">
        <div className="row h-100">
          <div
            className="col-md-2 col-sm-2 bg-dark text-light d-flex flex-column h-100"
            style={{ boxShadow: "2px 0px 6px rgba(0,0,0,0.1)" }}
          >
            <div className="d-flex align-items-center pt-3">
              <h4 className="codecast-title ms-0 mb-3">{"< /> "}CodeSync</h4>
            </div>
            <hr style={{ marginTop: "0rem" }} />
            <div className="d-flex flex-column overflow-auto">
              {clients.map((client) => (
                <Client key={client.socketId} username={client.username} />
              ))}
            </div>
            <div className="mt-auto">
              <hr />
              <button className="btn btn-success" onClick={copyRoomId}>
                Copy Room ID
              </button>
              <button
                className="btn btn-danger mt-2 px-3 btn-block"
                onClick={leaveRoom}
              >
                Leave Room
              </button>
            </div>
          </div>
          <div className="col-md-10 col-sm-10 text-light d-flex flex-column h-100">
            {socketRef.current && (
              <Editor
                socketRef={socketRef}
                roomId={roomId}
                onCodeChange={(code) => (codeRef.current = code)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
