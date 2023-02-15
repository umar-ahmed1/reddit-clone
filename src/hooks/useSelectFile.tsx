import React from 'react';



const useSelectFile = () => {
    const [selectedFile,setSelectedFile] = React.useState<string>()
    //select the image
    const onSelectFile = (event:React.ChangeEvent<HTMLInputElement>) => {
        //create a file reader
        const reader = new FileReader()
        //see if there are any files (there cud be many files so this is an array)
        if (event.target.files?.[0]){
            reader.readAsDataURL(event.target.files[0]) //FileReader reads the file
            reader.onload = (readerEvent) => {     //onload triggers once the readasdataURL completes
                if (readerEvent.target?.result){    //if there was a result
                    setSelectedFile(readerEvent.target.result as string) //set the selected file
                }
            }   
        }
    }
    
    return {
        selectedFile,setSelectedFile,onSelectFile
    }
}
export default useSelectFile;