import { useCallback, useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'

interface CodeEditorProps {
  initialValue?: string
  onChange?: (value: string) => void
}

export const CodeEditor = ({ initialValue = '', onChange }: CodeEditorProps) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleChange = useCallback(
    (val: string) => {
      setValue(val)
      onChange?.(val)
    },
    [onChange]
  )

  return (
    <CodeMirror
      value={value}
      height="400px"
      theme={vscodeDark}
      extensions={[javascript()]}
      onChange={handleChange}
      className="text-sm"
    />
  )
}
