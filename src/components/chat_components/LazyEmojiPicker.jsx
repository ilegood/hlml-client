import { useEffect, useState } from "react";

let pickerModulePromise = null;

const loadPickerModule = () => {
  pickerModulePromise ??= Promise.all([
    import("@emoji-mart/react"),
    import("@emoji-mart/data"),
  ]).then(([pickerModule, dataModule]) => ({
    Picker: pickerModule.default,
    data: dataModule.default,
  }));

  return pickerModulePromise;
};

export default function LazyEmojiPicker(props) {
  const [module, setModule] = useState(null);

  useEffect(() => {
    let active = true;

    loadPickerModule().then((loadedModule) => {
      if (active) setModule(loadedModule);
    });

    return () => {
      active = false;
    };
  }, []);

  if (!module) return null;

  const { Picker, data } = module;
  return <Picker data={data} {...props} />;
}
