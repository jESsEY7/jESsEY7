from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('vehicles', '0004_photo_thumbnail'),
    ]

    operations = [
        migrations.AddField(
            model_name='photo',
            name='phash',
            field=models.CharField(blank=True, max_length=64, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='photo',
            name='is_duplicate',
            field=models.BooleanField(default=False),
        ),
    ]
