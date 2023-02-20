import styled from '@emotion/styled'
import Button from 'components/Button'
import Image from 'next/image'
import React, { useRef, useState } from 'react'

export default function ImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState('')

  const handleUpload = () => {
    if (inputRef.current && inputRef.current.files) {
      const fd = new FormData()
      fd.append(
        'image',
        inputRef.current.files[0],
        inputRef.current.files[0].name
      )

      fetch(
        'https://api.imgbb.com/1/upload?key=4f78d820ef455512511752317d835b5f&expiration=15552000',
        {
          method: 'POST',
          body: fd,
        }
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data)

          setImage(data.data.image.url)
        })
        .catch((error) => console.log(error))
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" />
      <Button onClick={handleUpload}>업로드</Button>
      {image !== '' && (
        <AutoSizeImageWrapper>
          <Image src={image} alt="" layout="fill" objectFit="contain" />
        </AutoSizeImageWrapper>
      )}
    </div>
  )
}

const AutoSizeImageWrapper = styled.div`
  width: 500px;
  height: 500px;
  position: relative;
`
