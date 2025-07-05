import React, { useState } from "react";
import Avatar from "react-avatar";

function Client({ username }) {
  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <Avatar
          name={username.toString()}
          size="50"
          round="14px"
          className="me-3"
        />
        <h6>{username}</h6>
      </div>
    </div>
  );
}

export default Client;
