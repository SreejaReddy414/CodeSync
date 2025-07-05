import React, { useRef, useEffect } from "react";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import CodeMirror from "codemirror";

function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const editor = CodeMirror.fromTextArea(textareaRef.current, {
      mode: { name: "javascript", json: true },
      theme: "dracula",
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
    });
    editorRef.current = editor;

    // Immediately sync the initial code to codeRef
    onCodeChange(editor.getValue());

    editor.setSize(null, "100%");
    editor.on("change", (instance, changes) => {
      const { origin } = changes;
      const code = instance.getValue();
      onCodeChange(code);
      if (
        origin !== "setValue" &&
        socketRef.current // ensure socket is ready
      ) {
        socketRef.current.emit("code-change", {
          roomId,
          code,
        });
      }
    });

    return () => {
      editor.toTextArea(); // Cleanup
    };
  }, [socketRef, roomId, onCodeChange]);

  useEffect(() => {
    console.log("Attaching code-change listener", socketRef.current);
    if (!socketRef.current) return;

    const handleCodeChange = ({ code }) => {
      console.log("Received code-change event with code:", code);
      if (code != null && editorRef.current) {
        if (editorRef.current.getValue() !== code) {
          editorRef.current.setValue(code);
        }
      }
    };

    // Listen for code-change
    socketRef.current.on("code-change", handleCodeChange);

    socketRef.current.on("sync-code-response", ({ code }) => {
      if (code != null && editorRef.current) {
        if (editorRef.current.getValue() !== code) {
          editorRef.current.setValue(code);
        }
      }
    });

    socketRef.current.onAny((event, ...args) => {
      console.log("Socket event received:", event, args);
    });

    return () => {
      socketRef.current.off("code-change", handleCodeChange);
      socketRef.current.off("sync-code-response");
      socketRef.current.offAny();
    };
  }, [socketRef, roomId]);

  return (
    <div style={{ height: "600%" }}>
      <textarea ref={textareaRef} id="realtimeEditor"></textarea>
    </div>
  );
}

export default Editor;
