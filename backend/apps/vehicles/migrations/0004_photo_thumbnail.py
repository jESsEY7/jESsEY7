from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('vehicles', '0003_add_offers_testdrives'),
    ]

    operations = [
        migrations.AddField(
            model_name='photo',
            name='file_key',
            field=models.CharField(blank=True, max_length=512, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='photo',
            name='thumbnail_url',
            field=models.URLField(blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='photo',
            name='processed',
            field=models.BooleanField(default=False),
        ),
    ]
