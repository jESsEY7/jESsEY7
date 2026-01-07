from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_make_phone_optional'),
    ]

    operations = [
        migrations.AlterField(
            model_name='car',
            name='features',
            field=models.JSONField(blank=True, default=list, null=True),
        ),
    ]
