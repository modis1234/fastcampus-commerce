import GoogleLogin from 'components/GoogleLogin'
import React from 'react'

export default function Login() {
  return (
    <div
      style={{
        display: 'flex',
        height: '70vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <GoogleLogin />
    </div>
  )
}
