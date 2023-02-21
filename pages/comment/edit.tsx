import { Slider } from '@mantine/core'
import AutoSizeImage from 'components/AutoSizeImage'
import CustomEditor from 'components/Editor'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'

export default function CommentEdit() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<string[]>([])
  const router = useRouter()
  const [rate, setRate] = useState(5)
  const { orderItemId } = router.query
  const [editorState, setEditorState] = useState<EditorState | undefined>(
    undefined
  )

  useEffect(() => {
    if (orderItemId) {
      fetch(`/api/get-comment?orderItemId=${orderItemId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.items.contents) {
            setEditorState(
              EditorState.createWithContent(
                convertFromRaw(JSON.parse(data.items.contents))
              )
            )
            setRate(data.items.rate)
            setImages(data.items.images.split(',') ?? [])
          } else {
            setEditorState(EditorState.createEmpty())
          }
        })
    }
  }, [orderItemId])

  const handleChange = () => {
    if (
      inputRef.current &&
      inputRef.current.files &&
      inputRef.current.files.length > 0
    ) {
      for (let i = 0; i < inputRef.current.files.length; i++) {
        const fd = new FormData()
        fd.append(
          'image',
          inputRef.current.files[i],
          inputRef.current.files[i].name
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

            setImages((prev) =>
              Array.from(new Set(prev.concat(data.data.image.url)))
            )
          })
          .catch((error) => console.log(error))
      }
    }
  }

  const handleSave = () => {
    if (editorState) {
      fetch(`/api/update-comment`, {
        method: 'POST',
        body: JSON.stringify({
          orderItemId: Number(orderItemId),
          rate: rate,
          contents: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
          images: images.join(','),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          alert('Success')
          router.back()
        })
    }
  }
  return (
    <div>
      {editorState !== null && (
        <CustomEditor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          onSave={handleSave}
        />
      )}
      <Slider
        defaultValue={5}
        min={1}
        max={5}
        step={1}
        onChange={setRate}
        marks={[
          { value: 1 },
          { value: 2 },
          { value: 3 },
          { value: 4 },
          { value: 5 },
        ]}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
      />
      <div style={{ display: 'flex' }}>
        {images &&
          images.length > 0 &&
          images.map((image, idx) => <AutoSizeImage key={idx} src={image} />)}
      </div>
    </div>
  )
}
