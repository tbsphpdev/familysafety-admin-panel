import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError, from } from 'rxjs';
import { GlobalComponent } from "../../../global-component";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { environment } from '../../../../environments/environment';

const API_URL = GlobalComponent.API_URL;

@Injectable({
  providedIn: 'root',
})
export class ProfileSettingsService {
  constructor(private http: HttpClient) { }

  private s3Client = new S3Client({
    endpoint: environment.digitalOceanSpaces.endpoint,
    region: environment.digitalOceanSpaces.region,
    credentials: {
      accessKeyId: environment.digitalOceanSpaces.accessKey,
      secretAccessKey: environment.digitalOceanSpaces.secretKey
    }
  });
  updateProfile(token: string, payload: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    const url = API_URL + `profile/`;
    return this.http.patch<any>(url, payload, { ...httpOptions, observe: 'response' }).pipe(
      map((response: any) => {
        if (response.status !== 200 || (response.body?.status && response.body.status !== 200)) {
          throw {
            status: response.status,
            error: response.body,
            message: response.body?.message || 'Failed to update profile'
          };
        }
        return response.body;
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  changePassword(token: string, id: any, payload: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    const url = API_URL + `change_password/`;

    return this.http.post<any>(url, payload, { ...httpOptions, observe: 'response' }).pipe(
      map((response: any) => {
        if (response.status !== 200 || (response.body?.status && response.body.status !== 200)) {
          throw {
            status: response.status,
            error: response.body,
            message: response.body?.message || 'Failed to change password'
          };
        }
        return response.body;
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  uploadProfileImage(file: File): Observable<any> {
    const spaceName = environment.digitalOceanSpaces.bucket;
    const fileName = `admin-profile-images/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const uploadPromise = file.arrayBuffer().then((buffer) => {
      const fileBuffer = new Uint8Array(buffer);

      const command = new PutObjectCommand({
        Bucket: spaceName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.type,
        ACL: 'public-read'
      });

      return this.s3Client.send(command);
    }).then((s3Response) => {
      // console.log(s3Response);
      return {
        success: true,
        url: environment.digitalOceanSpaces.cdnBase + `/${fileName}`
      };
    }).catch((error) => {
      console.error('Error uploading to DigitalOcean Spaces:', error);
      throw new Error('Failed to upload profile image');
    });

    return from(uploadPromise);
  }

  deleteImageFromSpace(cdnUrl: string): Observable<any> {
    const spaceName = environment.digitalOceanSpaces.bucket;
    const cdnBaseUrl = environment.digitalOceanSpaces.cdnBase;

    const fileNameKey = cdnUrl.replace(cdnBaseUrl + '/', '');

    const deleteCommand = new DeleteObjectCommand({
      Bucket: spaceName,
      Key: fileNameKey
    });

    const deletePromise = this.s3Client.send(deleteCommand).then((response) => {
      return { success: true, deletedKey: fileNameKey, response };
    });

    return from(deletePromise);
  }
}
