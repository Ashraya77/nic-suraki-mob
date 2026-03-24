import { z } from "zod";

export const FormSchema = z.object({
  image_video: z
    .string()
    .nonempty("Image or video is required")
    .url("Invalid image or video URL")
    .optional(),
  gps_location: z
    .string()
    .nonempty("GPS location is required")
    

});
