import React from 'react';

export default function RobotInfor({ robotResource }) {
  const robot = robotResource.data.read();
  const { id, username, email } = robot;

  return (
    <div>
      <img src={robotResource.image.read()} alt='robot' />
      <div>{username}</div>
      <div>{email}</div>
    </div>
  )
}