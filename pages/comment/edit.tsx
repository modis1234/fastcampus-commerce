import { Slider } from '@mantine/core'
import CustomEditor from 'components/Editor'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function CommentEdit() {
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
          } else {
            setEditorState(EditorState.createEmpty())
          }
        })
    }
  }, [orderItemId])

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
          images: [],
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
    </div>
  )
}
