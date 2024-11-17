import { useCallback, useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'

interface CodeEditorProps {
  initialValue?: string
  onChange?: (value: string) => void
  className?: string
}

export const CodeEditor = ({ initialValue = '', onChange, className }: CodeEditorProps) => {
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
      height='100%'
      width='100%'
      theme={vscodeDark}
      extensions={[javascript()]}
      onChange={handleChange}
      className={className}
    />
  )
}
