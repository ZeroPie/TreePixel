<script lang="ts" setup>

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const photoHelper = usePhotoHelper()

const props = defineProps({
  path: {
    type: String,
    required: true,
  }
});

interface Profile {
  photo: String;
}

const emit = defineEmits<{
  (ev: 'update:path', _path: string): void;
  (ev: 'update:filePath', _path: string): void;
}>();

const uploading = ref<boolean>(false)
const uploadedImage = ref<boolean>(false)
const allowedFormats: string[] = ['jpg', 'jpeg', 'png'];

const uploadAvatar = async (evt: Event): Promise<void> => {
  const files = (evt.target as HTMLInputElement).files;
  try {
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const fileExt:any = file.name.split('.').pop()?.toLocaleLowerCase();
    if (!allowedFormats.includes(fileExt)) {
      alert('Only JPG, JPEG and PNG files are accepted.');
      return;
    }
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;
    uploading.value = true;
    let { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file);
    if (uploadError) throw uploadError;
    emit("update:filePath", filePath);
    const photoPath = await photoHelper.downloadPhoto(filePath);
    emit("update:path", photoPath);

  } catch (error: any) {
    alert(error.message);
  } finally {
    uploadedImage.value = true;
    uploading.value = false;
  }
};

const deleteImage = async () => {
  const { data: profile } = await useAsyncData('profile', async () => {
    const { data } = await supabase
      .from('profile')
      .select('photo')
      .eq('id', user.value?.id)
      .single()
    return data
  })
  if(profile){
    await supabase.storage.from('photos').remove((profile.value as Profile).photo.split(','))
  }
  emit("remove:path", null);
  // const updateInfo= [{
  //   photo: null,
  // }]
  // await supabase
  //     .from('profile')
  //     .update(updateInfo as never)
  //     .eq('id', user.value?.id)
  //     .single()
}
</script>

<template>
  <div class="userLogo pointer" @click="($refs.fileInput as HTMLInputElement).click()">
    <v-avatar :size="64" v-if="props.path !== ''" :image="props.path"></v-avatar>
    <v-avatar :size="64" v-else>
      <img src="/images/profile-photo.svg" alt="user" />
    </v-avatar>
    <div class="addplusBx" size="20">
      <i v-if="uploading" class="mdi mdi-timer-sand"></i>
      <img v-else src="/images/plus-icon-profile.svg" alt="plus" />
    </div>
  </div>
  <div class="pt-10" size="20" v-if="props.path !== ''" @click="deleteImage()">delete</div>
  <input ref="fileInput" style="display: none" type="file" accept="image/*" @change="uploadAvatar"
    :disabled="uploading" />
</template>
