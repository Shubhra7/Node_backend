import {v2 as cloudinary} from "cloudinary"
import fs from "fs" 

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (loaclFilePath)=>{
    try{
        if (!loaclFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(loaclFilePath,{
            resource_type: "auto"
        })
        // file has been uploaded successfull
        // console.log("File is uploaded on cloudinary", response.url);
        fs.unlinkSync(loaclFilePath)
        return response;

    }catch(error){
        // remove the locally saved temporary file as 
        // the upload operation got failed
        fs.unlinkSync(loaclFilePath) 
        return null
    }
}

const deleteOnColudinary = async (public_id, resource_type="image")=>{
    try {
        if(!public_id) return null;
        const result = await cloudinary.uploader.destroy(public_id,{
            resource_type:`${resource_type}`
        });
    } catch (error) {
        console.log("Delete on cloudinary failed!! ",error);
        return error;
    }
}

export {uploadOnCloudinary, deleteOnColudinary}