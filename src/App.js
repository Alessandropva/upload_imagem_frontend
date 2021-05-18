import { Container, Content } from './styles';
import GlobalStyle from './styles/global';
import Upload from './components/uploads';
import FileList from './components/fileList';
import { useEffect, useState } from 'react';
import { uniqueId } from 'lodash';
import  filesize from 'filesize';
import api from './services/api';

function App() {
   const [state, setstate] = useState({
    uploadedFiles: [],
  });

   var estado = state;
    const handleUpload = files => {
    const uploadedFiles = files.map(file => ({
      file,
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null,
    }))
   
    estado = {
         uploadedFiles: state.uploadedFiles.concat(uploadedFiles),
       }

   
    uploadedFiles.forEach(processUploaded);
};
 

const updateFile = (id, data) => {
     console.log(state);
  
  estado = {
    uploadedFiles: estado.uploadedFiles.map(uploadedFile => {
     
     return id === uploadedFile.id ? { ...uploadedFile, ...data } : uploadedFile;
     
   })
}
 setstate(estado);
 

  }
  
 

const processUploaded =(uploadedFile) =>{
    const data = new FormData();
    data.append("file", uploadedFile.file, uploadedFile.name);
    
    api.post("posts", data, {
      onUploadProgress: e => {
        const progress = parseInt(Math.round((e.loaded * 100) / e.total));
         updateFile(uploadedFile.id, {
             progress,
         });
      }
    }).then((response) => {
       
        updateFile(uploadedFile.id, {
          uploaded: true,
          id: response.data._id,
          url: response.data.url
        });
    }).catch(() => {
      updateFile(uploadedFile.id, {
        error: true,
      });
    });
}

 

  async function atualizar(){
    const response = await api.get('postsdb');
      setstate({
        uploadedFiles: response.data.map(file =>({
            id: file._id,
            name: file.name,
            readableSize: filesize(file.size),
            preview: file.url,
            uploaded: true,
            url: file.url,
        })),
    })
    }

useEffect( () => {
    atualizar();
    
 }, []);


 useEffect(() => {
    return () =>{
      state.uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    }
});

   const handleDelete = async(id) => {
          await api.delete(`posts/${id}`);
          setstate({uploadedFiles: state.uploadedFiles.filter(file => file.id !== id)});
   }
  const {uploadedFiles} = estado;
    
  return (
      <Container>
        <Content>
                <Upload onUpload={handleUpload}/>
                {!!uploadedFiles.length &&  <FileList files={uploadedFiles} onDelete={handleDelete}/>}        
                                
        </Content>
         <GlobalStyle/>
      </Container>
     
  );
}

export default App;
